import { prisma } from "../lib/prisma.js";
import { enqueueScoreTriggerNotify } from "../lib/queue.js";
import {
  computeCompositeScore,
  evaluateTrigger,
  type ThresholdConfig,
} from "../lib/scoring.js";
import { logger } from "../lib/logger.js";
import { fetchEhrWorkflowSignals } from "./epic-fhir-sync.js";

function ehrMinutesToSubScore(minutes: number): number {
  return Math.min(100, Math.round(minutes / 3));
}

/**
 * Nightly job (2am hospital local) — merges EHR metadata + last client POST sub-scores.
 */
export async function runScoreComputationForHospital(hospitalId: string): Promise<void> {
  const physicians = await prisma.physician.findMany({
    where: { hospitalId, deletedAt: null },
    select: {
      id: true,
      thresholdConfig: true,
    },
  });

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  for (const physician of physicians) {
    try {
      const existing = await prisma.distressScore.findUnique({
        where: {
          physicianId_date: { physicianId: physician.id, date: yesterday },
        },
      });

      const ehrSub = existing?.ehrSubScore ?? null;
      const wearableSub = existing?.wearableSubScore ?? null;
      const selfSub = existing?.selfReportSubScore ?? null;

      const composite = computeCompositeScore({
        ehr: ehrSub,
        wearable: wearableSub,
        selfReport: selfSub,
      });

      const config = physician.thresholdConfig as ThresholdConfig;
      const recent = await prisma.distressScore.findMany({
        where: { physicianId: physician.id },
        orderBy: { date: "desc" },
        take: config.sustained_days + 1,
        select: { compositeScore: true },
      });

      const hardEvent = await prisma.selfReport.findFirst({
        where: {
          physicianId: physician.id,
          tag: { in: ["lost_patient", "complication", "moral_injury"] },
          createdAt: { gte: yesterday },
        },
      });

      const trigger = evaluateTrigger(
        composite,
        config,
        recent.map((r: { compositeScore: number }) => r.compositeScore),
        !!hardEvent,
      );

      await prisma.distressScore.upsert({
        where: {
          physicianId_date: { physicianId: physician.id, date: yesterday },
        },
        create: {
          physicianId: physician.id,
          date: yesterday,
          compositeScore: composite,
          ehrSubScore: ehrSub,
          wearableSubScore: wearableSub,
          selfReportSubScore: selfSub,
          signalFlags: existing?.signalFlags ?? {},
          triggerFired: trigger.fired,
          triggerType: trigger.type,
        },
        update: {
          compositeScore: composite,
          triggerFired: trigger.fired,
          triggerType: trigger.type,
        },
      });

      if (trigger.fired && trigger.type) {
        await enqueueScoreTriggerNotify({
          physician_id: physician.id,
          trigger_type: trigger.type,
          score: composite,
          copy_variant: Math.floor(Math.random() * 5) + 1,
        });
      }
    } catch (err) {
      logger.error({ err, physicianId: physician.id }, "Score computation failed");
    }
  }
}

export async function applyEhrSignalsToScore(
  physicianId: string,
  signals: Awaited<ReturnType<typeof fetchEhrWorkflowSignals>>,
): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const ehrSub = ehrMinutesToSubScore(signals.after_hours_minutes);

  await prisma.distressScore.upsert({
    where: { physicianId_date: { physicianId, date: today } },
    create: {
      physicianId,
      date: today,
      compositeScore: ehrSub,
      ehrSubScore: ehrSub,
      signalFlags: { ehr_afterhours: signals.after_hours_minutes > 30 },
    },
    update: {
      ehrSubScore: ehrSub,
      signalFlags: { ehr_afterhours: signals.after_hours_minutes > 30 },
    },
  });
}
