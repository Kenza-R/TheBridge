import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import type { ScoreTriggerNotifyPayload } from "../lib/queue.js";

type NotificationPrefs = {
  silent_start: string;
  silent_end: string;
  max_per_day: number;
};

function inSilentHours(prefs: NotificationPrefs, now: Date): boolean {
  const [sh, sm] = prefs.silent_start.split(":").map(Number);
  const [eh, em] = prefs.silent_end.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start <= end) return mins >= start && mins < end;
  return mins >= start || mins < end;
}

export async function deliverScoreTriggerNotification(
  payload: ScoreTriggerNotifyPayload,
): Promise<void> {
  const physician = await prisma.physician.findUnique({
    where: { id: payload.physician_id },
    select: { notificationPrefs: true, deletedAt: true },
  });

  if (!physician || physician.deletedAt) return;

  const prefs = physician.notificationPrefs as NotificationPrefs;
  const now = new Date();

  if (inSilentHours(prefs, now)) {
    logger.info({ physicianId: payload.physician_id }, "Notification dropped — silent hours");
    return;
  }

  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const sentToday = await prisma.notification.count({
    where: {
      physicianId: payload.physician_id,
      createdAt: { gte: startOfDay },
      deliveredAt: { not: null },
    },
  });

  if (sentToday >= prefs.max_per_day) {
    logger.info({ physicianId: payload.physician_id }, "Notification dropped — max per day");
    return;
  }

  await prisma.notification.create({
    data: {
      physicianId: payload.physician_id,
      jobName: "score.trigger.notify",
      triggerType: payload.trigger_type,
      copyVariant: payload.copy_variant,
      deliveredAt: now,
    },
  });

  // TODO: Expo Push API (APNs + FCM) when EXPO_ACCESS_TOKEN is set
  logger.info(
    { physicianId: payload.physician_id, trigger: payload.trigger_type },
    "Push notification queued (stub)",
  );
}
