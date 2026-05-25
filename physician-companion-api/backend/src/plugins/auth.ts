import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { getEnv } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AdminClaims, PhysicianClaims } from "../types/auth.js";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  const env = getEnv();
  if (!env.AUTH0_JWKS_URI) {
    throw new Error("AUTH0_JWKS_URI is required for JWT validation");
  }
  jwks ??= createRemoteJWKSet(new URL(env.AUTH0_JWKS_URI));
  return jwks;
}

async function verifyBearer(request: FastifyRequest): Promise<JWTPayload> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw request.server.httpErrors.unauthorized("Missing bearer token");
  }
  const token = header.slice(7);
  const env = getEnv();

  if (env.NODE_ENV === "development" && token.startsWith("dev:")) {
    const [, role, subject, hospitalId, physicianId] = token.split(":");
    return {
      sub: subject ?? "dev-user",
      role: role ?? "physician",
      hospital_id: hospitalId,
      physician_id: physicianId,
    } as JWTPayload;
  }

  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: env.AUTH0_ISSUER,
    audience: [env.AUTH0_AUDIENCE, env.AUTH0_ADMIN_AUDIENCE].filter(Boolean) as string[],
  });
  return payload;
}

export const authPlugin: FastifyPluginAsync = fp(async (app) => {
  app.decorate("requirePhysician", async (request: FastifyRequest) => {
    const payload = await verifyBearer(request);
    const role =
      (payload["https://bridge.health/role"] as string | undefined) ??
      (payload.role as string | undefined);

    if (role === "hospital_admin") {
      throw app.httpErrors.forbidden("Admin token cannot access physician routes");
    }

    const sub = payload.sub;
    if (!sub) throw app.httpErrors.unauthorized("Invalid token subject");

    let physicianId = payload["https://bridge.health/physician_id"] as string | undefined;
    if (!physicianId) {
      const physician = await prisma.physician.findFirst({
        where: { auth0Subject: sub, deletedAt: null },
        select: { id: true, hospitalId: true },
      });
      if (!physician) {
        throw app.httpErrors.unauthorized("Physician profile not found");
      }
      physicianId = physician.id;
      request.auth = {
        sub,
        role: "physician",
        physicianId: physician.id,
        hospitalId: physician.hospitalId,
      } satisfies PhysicianClaims;
      return;
    }

    const hospitalId = payload["https://bridge.health/hospital_id"] as string;
    request.auth = {
      sub,
      role: "physician",
      physicianId,
      hospitalId,
    } satisfies PhysicianClaims;
  });

  app.decorate("requireAdmin", async (request: FastifyRequest) => {
    const payload = await verifyBearer(request);
    const role =
      (payload["https://bridge.health/role"] as string | undefined) ??
      (payload.role as string | undefined);

    if (role !== "hospital_admin") {
      throw app.httpErrors.forbidden("Hospital admin role required");
    }

    const hospitalId = payload["https://bridge.health/hospital_id"] as string | undefined;
    if (!hospitalId) {
      throw app.httpErrors.unauthorized("Missing hospital_id claim");
    }

    request.auth = {
      sub: payload.sub!,
      role: "hospital_admin",
      hospitalId,
    } satisfies AdminClaims;
  });
});

declare module "fastify" {
  interface FastifyInstance {
    requirePhysician: (request: FastifyRequest) => Promise<void>;
    requireAdmin: (request: FastifyRequest) => Promise<void>;
  }
}
