import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import type { AdminClaims } from "../types/auth.js";

export const adminRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requireAdmin] };

  app.get(`${app.config.apiPrefix}/admin/dashboard`, pre, async (request) => {
    const auth = request.auth as AdminClaims;

    const snapshot = await prisma.hospitalAggregateSnapshot.findFirst({
      where: { hospitalId: auth.hospitalId },
      orderBy: { weekStart: "desc" },
    });

    if (!snapshot) {
      return { snapshot: null, message: "No aggregate data yet" };
    }

    return {
      week_start: snapshot.weekStart,
      active_physicians: snapshot.activePhysicians,
      pct_elevated: snapshot.pctElevated,
      peer_support_utilization: snapshot.peerSupportUtilization,
      total_wellness_sessions: snapshot.totalWellnessSessions,
      median_recovery_days: snapshot.medianRecoveryDays,
    };
  });

  app.get(`${app.config.apiPrefix}/admin/physician/scores`, pre, async (_request, reply) => {
    return reply.status(403).send({
      error: "Individual distress_scores are not accessible to hospital administrators",
    });
  });
};
