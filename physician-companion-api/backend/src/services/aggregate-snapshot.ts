import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const MIN_COHORT = 10;

export async function generateWeeklySnapshots(): Promise<void> {
  const hospitals = await prisma.hospital.findMany({ select: { id: true } });
  const weekStart = startOfWeekUtc(new Date());

  for (const { id: hospitalId } of hospitals) {
    const activePhysicians = await prisma.physician.count({
      where: { hospitalId, deletedAt: null },
    });

    const scores = await prisma.distressScore.findMany({
      where: {
        physician: { hospitalId, deletedAt: null },
        date: { gte: weekStart },
      },
      select: { compositeScore: true, triggerFired: true },
    });

    const elevatedThreshold = 70;
    const elevated = scores.filter((s: { compositeScore: number }) => s.compositeScore >= elevatedThreshold).length;

    const pctElevated =
      activePhysicians >= MIN_COHORT && scores.length > 0
        ? Math.round((elevated / scores.length) * 10000) / 100
        : null;

    const peerUtil =
      activePhysicians >= MIN_COHORT
        ? await computePeerUtilization(hospitalId, weekStart)
        : null;

    const wellnessCount = await prisma.wellnessSession.count({
      where: {
        physician: { hospitalId },
        createdAt: { gte: weekStart },
      },
    });

    await prisma.hospitalAggregateSnapshot.upsert({
      where: {
        hospitalId_weekStart: { hospitalId, weekStart },
      },
      create: {
        hospitalId,
        weekStart,
        activePhysicians,
        pctElevated,
        peerSupportUtilization: peerUtil,
        totalWellnessSessions: wellnessCount,
        medianRecoveryDays: null,
      },
      update: {
        activePhysicians,
        pctElevated,
        peerSupportUtilization: peerUtil,
        totalWellnessSessions: wellnessCount,
      },
    });

    logger.info({ hospitalId, weekStart }, "Aggregate snapshot written");
  }
}

async function computePeerUtilization(
  hospitalId: string,
  since: Date,
): Promise<number | null> {
  const messages = await prisma.peerMessage.count({
    where: {
      createdAt: { gte: since },
      sender: { hospitalId },
    },
  });
  const physicians = await prisma.physician.count({
    where: { hospitalId, deletedAt: null },
  });
  if (physicians < MIN_COHORT) return null;
  const rate = (messages / physicians) * 100;
  return Math.round(rate * 100) / 100;
}

function startOfWeekUtc(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  copy.setUTCDate(copy.getUTCDate() - diff);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}
