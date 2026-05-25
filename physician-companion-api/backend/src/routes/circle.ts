import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { withPhysicianContext, prisma } from "../lib/prisma.js";
import type { PhysicianClaims } from "../types/auth.js";

const inviteSchema = z.object({
  target_physician_id: z.string().uuid(),
  role: z.enum(["first_reach", "backup", "checkin_buddy"]),
  notify_rule: z.enum(["always", "delayed_4h", "manual_only"]),
});

const respondSchema = z.object({
  status: z.enum(["accepted", "declined", "limited"]),
});

export const circleRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.get(`${app.config.apiPrefix}/physician/me/circle`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const [owned, incoming] = await Promise.all([
      withPhysicianContext(auth.physicianId, async (tx) =>
        tx.circleMember.findMany({
          where: { ownerId: auth.physicianId },
          include: {
            member: {
              select: {
                id: true,
                specialty: true,
                careerStage: true,
                displayName: true,
              },
            },
          },
        }),
      ),
      prisma.circleMember.findMany({
        where: { memberId: auth.physicianId, status: "pending" },
        include: {
          owner: {
            select: {
              id: true,
              specialty: true,
              careerStage: true,
              displayName: true,
            },
          },
        },
      }),
    ]);
    return { circle: owned, incoming };
  });

  app.post(`${app.config.apiPrefix}/physician/me/circle/invite`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const body = inviteSchema.parse(request.body);

    if (body.target_physician_id === auth.physicianId) {
      throw app.httpErrors.badRequest("Cannot invite yourself");
    }

    const target = await prisma.physician.findFirst({
      where: {
        id: body.target_physician_id,
        hospitalId: auth.hospitalId,
        deletedAt: null,
      },
    });
    if (!target) throw app.httpErrors.notFound("Colleague not found at your institution");

    const invite = await withPhysicianContext(auth.physicianId, async (tx) =>
      tx.circleMember.create({
        data: {
          ownerId: auth.physicianId,
          memberId: body.target_physician_id,
          role: body.role,
          notifyRule: body.notify_rule,
          status: "pending",
        },
      }),
    );

    return { invite };
  });

  app.patch(`${app.config.apiPrefix}/circle-invites/:id/respond`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const { id } = request.params as { id: string };
    const body = respondSchema.parse(request.body);

    const invite = await prisma.circleMember.findUnique({ where: { id } });
    if (!invite || invite.memberId !== auth.physicianId) {
      throw app.httpErrors.notFound("Invite not found");
    }

    const updated = await withPhysicianContext(auth.physicianId, async (tx) =>
      tx.circleMember.update({
        where: { id },
        data: {
          status: body.status,
          acceptedAt: body.status === "accepted" ? new Date() : null,
        },
      }),
    );

    return { invite: updated };
  });
};
