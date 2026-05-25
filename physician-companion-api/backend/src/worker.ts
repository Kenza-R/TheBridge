import "dotenv/config";
import type { Job } from "bullmq";
import {
  JOB_NAMES,
  QUEUE_NAMES,
  createWorker,
  type ScoreTriggerNotifyPayload,
} from "./lib/queue.js";
import { logger } from "./lib/logger.js";
import { deliverScoreTriggerNotification } from "./services/notification-delivery.js";

async function main() {
  const notificationWorker = createWorker(
    QUEUE_NAMES.notifications,
    async (job: Job) => {
      if (job.name === JOB_NAMES.scoreTriggerNotify) {
        await deliverScoreTriggerNotification(job.data as ScoreTriggerNotifyPayload);
      }
    },
  );

  notificationWorker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Notification job failed");
  });

  logger.info("BullMQ workers started");
}

main();
