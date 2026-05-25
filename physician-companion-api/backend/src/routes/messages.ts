import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { withPhysicianContext } from "../lib/prisma.js";
import type { PhysicianClaims } from "../types/auth.js";

const MESSAGE_TTL_DAYS = 30;

const sendSchema = z.object({
  recipient_id: z.string().uuid(),
  body: z.string().min(1).max(4000),
  message_type: z.enum(["outreach", "response", "schedule", "flag"]),
  include_schedule_cta: z.boolean().optional(),
});

export const messageRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.post(`${app.config.apiPrefix}/messages`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const body = sendSchema.parse(request.body);
    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + MESSAGE_TTL_DAYS);

    const message = await withPhysicianContext(auth.physicianId, async (tx) =>
      tx.peerMessage.create({
        data: {
          senderId: auth.physicianId,
          recipientId: body.recipient_id,
          messageBody: body.body,
          messageType: body.message_type,
          status: "sent",
          scheduledAt: body.include_schedule_cta ? new Date() : null,
          expiresAt,
        },
      }),
    );

    return { message: { id: message.id, status: message.status, expires_at: message.expiresAt } };
  });

  app.get(`${app.config.apiPrefix}/messages`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const unreadOnly = (request.query as { unread?: string }).unread === "true";

    const direction = (request.query as { direction?: string }).direction ?? "inbox";

    const messages = await withPhysicianContext(auth.physicianId, async (tx) => {
      if (direction === "sent") {
        return tx.peerMessage.findMany({
          where: { senderId: auth.physicianId },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            senderId: true,
            recipientId: true,
            messageBody: true,
            messageType: true,
            status: true,
            scheduledAt: true,
            createdAt: true,
            expiresAt: true,
            recipient: {
              select: { id: true, displayName: true, specialty: true },
            },
          },
        });
      }

      return tx.peerMessage.findMany({
        where: {
          recipientId: auth.physicianId,
          ...(unreadOnly ? { status: { in: ["sent", "delivered"] } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          senderId: true,
          recipientId: true,
          messageBody: true,
          messageType: true,
          status: true,
          scheduledAt: true,
          createdAt: true,
          expiresAt: true,
          sender: {
            select: { id: true, displayName: true, specialty: true },
          },
        },
      });
    });

    return { messages };
  });
};
