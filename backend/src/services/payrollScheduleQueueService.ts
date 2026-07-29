import { Queue } from 'bullmq';
import { redisConnection, SCHEDULE_QUEUE_NAME } from '../config/queue.js';
import logger from '../utils/logger.js';

const DISPATCH_INTERVAL_MS = 60_000;

export class PayrollScheduleQueueService {
  private static queue: Queue | null = null;

  static getQueue(): Queue {
    if (!this.queue) {
      this.queue = new Queue(SCHEDULE_QUEUE_NAME, { connection: redisConnection });
    }
    return this.queue;
  }

  /**
   * Registers the recurring dispatch tick. BullMQ dedupes repeatable jobs by
   * their key (name + repeat options), so calling this on every server boot
   * is safe and idempotent — it won't create duplicate schedulers.
   */
  static async ensureDispatchTickScheduled(): Promise<void> {
    try {
      const queue = this.getQueue();
      await queue.add(
        'dispatch-tick',
        {},
        { repeat: { every: DISPATCH_INTERVAL_MS }, jobId: 'schedule-dispatcher' }
      );
      logger.info(`Payroll schedule dispatcher registered (every ${DISPATCH_INTERVAL_MS}ms)`);
    } catch (error) {
      logger.error('Failed to register payroll schedule dispatcher', error);
    }
  }
}
