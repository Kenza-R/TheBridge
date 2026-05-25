import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma, withPhysicianContext } from "../lib/prisma.js";
import type { PhysicianClaims } from "../types/auth.js";

const selfReportSchema = z.object({
  tag: z.enum([
    "rough_shift",
    "lost_patient",
    "complication",
    "hostile_encounter",
    "long_shift",
    "moral_injury",
    "other",
  ]),
});

const concernFlagSchema = z.object({
  target_id: z.string().uuid(),
  private_note: z.string().max(500).optional(),
});

export const selfReportRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.post(`${app.config.apiPrefix}/self-report`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const body = selfReportSchema.parse(request.body);

    const report = await withPhysicianContext(auth.physicianId, async (tx) =>
      tx.selfReport.create({
        data: { physicianId: auth.physicianId, tag: body.tag },
      }),
    );

    return { id: report.id, tag: report.tag };
  });

  app.post(`${app.config.apiPrefix}/concern-flags`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const body = concernFlagSchema.parse(request.body);

    if (body.target_id === auth.physicianId) {
      throw app.httpErrors.badRequest("Cannot flag yourself");
    }

    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 14);

    const flag = await prisma.concernFlag.create({
      data: {
        hospitalId: auth.hospitalId,
        raisedById: auth.physicianId,
        targetId: body.target_id,
        privateNote: body.private_note,
        expiresAt,
      },
    });

    return { id: flag.id, expires_at: flag.expiresAt };
  });
};
