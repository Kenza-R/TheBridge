import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ status: "ok", service: "physician-companion-api" }));
  app.get("/health/ready", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      throw app.httpErrors.serviceUnavailable("database unavailable");
    }
    return { status: "ready" };
  });
};
