import { Queue, Worker, type JobsOptions, type Processor } from "bullmq";
import { getRedis } from "./redis.js";

export const QUEUE_NAMES = {
  notifications: "notifications",
  scores: "scores",
} as const;

export const JOB_NAMES = {
  scoreTriggerNotify: "score.trigger.notify",
  messageExpiry: "message.expiry",
  aggregateSnapshot: "aggregate.snapshot",
  epicFhirSync: "epic.fhir.sync",
} as const;

export type ScoreTriggerNotifyPayload = {
  physician_id: string;
  trigger_type: "sustained" | "acute" | "hard_event";
  score: number;
  copy_variant: number;
};

function connection() {
  return { connection: getRedis() };
}

export function getNotificationQueue(): Queue {
  return new Queue(QUEUE_NAMES.notifications, connection());
}

export function getScoreQueue(): Queue {
  return new Queue(QUEUE_NAMES.scores, connection());
}

export async function enqueueScoreTriggerNotify(
  data: ScoreTriggerNotifyPayload,
  opts: JobsOptions = {},
): Promise<void> {
  const queue = getNotificationQueue();
  await queue.add(JOB_NAMES.scoreTriggerNotify, data, {
    delay: 0,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    ...opts,
  });
}

export function createWorker(
  queueName: string,
  processor: Processor,
): Worker {
  return new Worker(queueName, processor, connection());
}
