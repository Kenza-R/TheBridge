import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { withPhysicianContext } from "../lib/prisma.js";
import type { PhysicianClaims } from "../types/auth.js";

const MEDITATION_CATALOG = [
  { id: "reset-90", title: "90-second reset", duration_sec: 90, cdn_key: "meditations/reset-90.mp3" },
  { id: "debrief-3", title: "3-minute debrief", duration_sec: 180, cdn_key: "meditations/debrief-3.mp3" },
];

const sessionSchema = z.object({
  session_type: z.string().max(40),
  duration_sec: z.number().int().positive().max(7200),
});

export const wellnessRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.get(`${app.config.apiPrefix}/wellness/meditations`, pre, async () => {
    return {
      tracks: MEDITATION_CATALOG.map((t) => ({
        ...t,
        url: null,
        note: "Pre-signed S3 URLs issued in production via CloudFront",
      })),
    };
  });

  app.post(`${app.config.apiPrefix}/wellness/sessions`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const body = sessionSchema.parse(request.body);

    const session = await withPhysicianContext(auth.physicianId, async (tx) =>
      tx.wellnessSession.create({
        data: {
          physicianId: auth.physicianId,
          sessionType: body.session_type,
          durationSec: body.duration_sec,
        },
      }),
    );

    return { id: session.id };
  });
};
