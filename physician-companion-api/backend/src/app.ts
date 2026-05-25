import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import { getEnv } from "./config/env.js";
import { authPlugin } from "./plugins/auth.js";
import { auditPlugin } from "./plugins/audit.js";
import { healthRoutes } from "./routes/health.js";
import { physicianRoutes } from "./routes/physician.js";
import { circleRoutes } from "./routes/circle.js";
import { messageRoutes } from "./routes/messages.js";
import { selfReportRoutes } from "./routes/self-report.js";
import { peerRoutes } from "./routes/peers.js";
import { wellnessRoutes } from "./routes/wellness.js";
import { fhirRoutes } from "./routes/fhir.js";
import { adminRoutes } from "./routes/admin.js";

export async function buildApp() {
  const env = getEnv();

  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
    trustProxy: true,
  });

  app.decorate("config", {
    apiPrefix: env.API_PREFIX,
  });

  const devOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
  ];
  await app.register(cors, {
    origin:
      env.NODE_ENV === "development"
        ? (origin, cb) => {
            if (!origin || devOrigins.includes(origin)) {
              cb(null, true);
              return;
            }
            cb(null, false);
          }
        : false,
    credentials: true,
  });
  await app.register(helmet);
  await app.register(sensible);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) => {
      const auth = req.auth;
      return auth?.sub ?? req.ip;
    },
  });

  await app.register(authPlugin);
  await app.register(auditPlugin);

  await app.register(healthRoutes);
  await app.register(physicianRoutes);
  await app.register(circleRoutes);
  await app.register(messageRoutes);
  await app.register(selfReportRoutes);
  await app.register(peerRoutes);
  await app.register(wellnessRoutes);
  await app.register(fhirRoutes);
  await app.register(adminRoutes);

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    config: { apiPrefix: string };
  }
}
