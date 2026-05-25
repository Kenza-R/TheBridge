import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import type { PhysicianClaims } from "../types/auth.js";

export const peerRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.get(`${app.config.apiPrefix}/peers/search`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const q = request.query as { q?: string; specialty?: string };

    const physicians = await prisma.physician.findMany({
      where: {
        hospitalId: auth.hospitalId,
        deletedAt: null,
        id: { not: auth.physicianId },
        ...(q.specialty ? { specialty: { contains: q.specialty, mode: "insensitive" } } : {}),
        ...(q.q
          ? {
              OR: [
                { displayName: { contains: q.q, mode: "insensitive" } },
                { specialty: { contains: q.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 25,
      select: {
        id: true,
        displayName: true,
        specialty: true,
        careerStage: true,
      },
    });

    return { peers: physicians };
  });
};
