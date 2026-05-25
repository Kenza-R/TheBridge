import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

export const auditPlugin: FastifyPluginAsync = fp(async (app) => {
  app.addHook("onResponse", async (request, reply) => {
    if (request.url.startsWith("/health")) return;

    const auth = request.auth;
    await prisma.auditLog.create({
      data: {
        actorSubject: auth?.sub ?? null,
        actorRole: auth?.role ?? "anonymous",
        method: request.method,
        path: request.url.slice(0, 512),
        statusCode: reply.statusCode,
        ipAddress: request.ip,
      },
    });
  });
});
