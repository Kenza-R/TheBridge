import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const ELEVATED_THRESHOLD = 70;

/**
 * Daily: expire flags after 14 days; count flag+elevated convergence for CWO reporting (counts only).
 */
export async function resolveConcernFlags(): Promise<{ expired: number; convergenceCount: number }> {
  const now = new Date();

  const expired = await prisma.concernFlag.updateMany({
    where: { status: "active", expiresAt: { lt: now } },
    data: { status: "expired" },
  });

  const activeFlags = await prisma.concernFlag.findMany({
    where: { status: "active" },
    select: { targetId: true, hospitalId: true },
  });

  let convergenceCount = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const flag of activeFlags) {
    const score = await prisma.distressScore.findUnique({
      where: {
        physicianId_date: { physicianId: flag.targetId, date: today },
      },
    });
    if (score && score.compositeScore >= ELEVATED_THRESHOLD) {
      convergenceCount += 1;
    }
  }

  logger.info(
    { expired: expired.count, convergenceCount },
    "Concern flags resolved",
  );

  return { expired: expired.count, convergenceCount };
}
