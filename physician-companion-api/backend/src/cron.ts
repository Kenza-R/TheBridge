import "dotenv/config";
import { getEnv } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";
import { runScoreComputationForHospital } from "./services/score-computation.js";
import { runHospitalEpicSync } from "./services/epic-fhir-sync.js";
import { generateWeeklySnapshots } from "./services/aggregate-snapshot.js";
import { purgeExpiredMessages } from "./services/message-expiry.js";
import { resolveConcernFlags } from "./services/concern-flag-resolver.js";

/**
 * Single-process cron runner for local/dev.
 * Production: split into separate EKS CronJobs (score, epic, aggregate, expiry, flags).
 */
async function tick(): Promise<void> {
  const env = getEnv();
  const hospitals = await prisma.hospital.findMany({ select: { id: true } });

  await purgeExpiredMessages();
  await resolveConcernFlags();

  if (env.ENABLE_SCORE_CRON) {
    for (const { id } of hospitals) {
      await runScoreComputationForHospital(id);
    }
  }

  if (env.ENABLE_EPIC_SYNC) {
    for (const { id } of hospitals) {
      await runHospitalEpicSync(id);
    }
  }

  const day = new Date().getUTCDay();
  const hour = new Date().getUTCHours();
  if (day === 0 && hour === 3) {
    await generateWeeklySnapshots();
  }
}

async function main() {
  logger.info("Cron scheduler started (hourly tick)");
  await tick();
  setInterval(() => {
    tick().catch((err) => logger.error({ err }, "Cron tick failed"));
  }, 60 * 60 * 1000);
}

main();
