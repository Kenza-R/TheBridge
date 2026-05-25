import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { withPhysicianContext, prisma } from "../lib/prisma.js";
import { computeCompositeScore } from "../lib/scoring.js";
import type { PhysicianClaims } from "../types/auth.js";

const patchMeSchema = z.object({
  wearable_type: z
    .enum(["apple_watch", "garmin", "whoop", "oura", "fitbit", "none"])
    .nullable()
    .optional(),
  onboarding_done: z.boolean().optional(),
  threshold_config: z
    .object({
      sustained_days: z.number().int().min(1).max(14),
      sustained_score: z.number().int().min(0).max(100),
      acute: z.number().int().min(0).max(100),
    })
    .optional(),
  notification_prefs: z
    .object({
      silent_start: z.string().regex(/^\d{2}:\d{2}$/),
      silent_end: z.string().regex(/^\d{2}:\d{2}$/),
      max_per_day: z.number().int().min(0).max(5),
    })
    .optional(),
});

const scoreBodySchema = z.object({
  composite: z.number().int().min(0).max(100).optional(),
  ehr: z.number().int().min(0).max(100).nullable().optional(),
  wearable: z.number().int().min(0).max(100).nullable().optional(),
  self_report: z.number().int().min(0).max(100).nullable().optional(),
  signal_flags: z.record(z.boolean()).optional(),
});

function physician(request: { auth?: unknown }): PhysicianClaims {
  return request.auth as PhysicianClaims;
}

export const physicianRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.get(`${app.config.apiPrefix}/physician/me`, pre, async (request) => {
    const { physicianId } = physician(request);
    const profile = await prisma.physician.findUniqueOrThrow({
      where: { id: physicianId },
      select: {
        id: true,
        npi: true,
        displayName: true,
        specialty: true,
        careerStage: true,
        onboardingDone: true,
        wearableType: true,
        thresholdConfig: true,
        notificationPrefs: true,
        hospitalId: true,
      },
    });
    return profile;
  });

  app.patch(`${app.config.apiPrefix}/physician/me`, pre, async (request) => {
    const { physicianId } = physician(request);
    const body = patchMeSchema.parse(request.body);

    const data: Record<string, unknown> = {};
    if (body.wearable_type !== undefined) {
      data.wearableType = body.wearable_type === "none" ? null : body.wearable_type;
    }
    if (body.onboarding_done !== undefined) data.onboardingDone = body.onboarding_done;
    if (body.threshold_config !== undefined) data.thresholdConfig = body.threshold_config;
    if (body.notification_prefs !== undefined) data.notificationPrefs = body.notification_prefs;

    const updated = await prisma.physician.update({
      where: { id: physicianId },
      data,
      select: {
        id: true,
        npi: true,
        displayName: true,
        specialty: true,
        careerStage: true,
        onboardingDone: true,
        wearableType: true,
        thresholdConfig: true,
        notificationPrefs: true,
        hospitalId: true,
      },
    });

    return updated;
  });

  app.post(`${app.config.apiPrefix}/physician/me/score`, pre, async (request) => {
    const { physicianId } = physician(request);
    const body = scoreBodySchema.parse(request.body);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const composite =
      body.composite ??
      computeCompositeScore({
        ehr: body.ehr,
        wearable: body.wearable,
        selfReport: body.self_report,
        signalFlags: body.signal_flags,
      });

    const row = await withPhysicianContext(physicianId, async (tx) =>
      tx.distressScore.upsert({
        where: {
          physicianId_date: { physicianId, date: today },
        },
        create: {
          physicianId,
          date: today,
          compositeScore: composite,
          ehrSubScore: body.ehr ?? null,
          wearableSubScore: body.wearable ?? null,
          selfReportSubScore: body.self_report ?? null,
          signalFlags: body.signal_flags ?? {},
        },
        update: {
          compositeScore: composite,
          ehrSubScore: body.ehr ?? null,
          wearableSubScore: body.wearable ?? null,
          selfReportSubScore: body.self_report ?? null,
          signalFlags: body.signal_flags ?? {},
        },
      }),
    );

    return { id: row.id, composite_score: row.compositeScore, date: row.date };
  });

  app.get(`${app.config.apiPrefix}/physician/me/scores`, pre, async (request) => {
    const { physicianId } = physician(request);
    const days = Math.min(Number((request.query as { days?: string }).days ?? 90), 365);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const scores = await withPhysicianContext(physicianId, async (tx) =>
      tx.distressScore.findMany({
        where: { physicianId, date: { gte: since } },
        orderBy: { date: "desc" },
      }),
    );

    return { scores };
  });

  app.delete(`${app.config.apiPrefix}/physician/me`, pre, async (request) => {
    const { physicianId } = physician(request);
    await prisma.physician.update({
      where: { id: physicianId },
      data: { deletedAt: new Date() },
    });
    await prisma.peerMessage.deleteMany({
      where: {
        OR: [{ senderId: physicianId }, { recipientId: physicianId }],
      },
    });
    return { status: "scheduled_for_anonymization", within_hours: 24 };
  });
};
