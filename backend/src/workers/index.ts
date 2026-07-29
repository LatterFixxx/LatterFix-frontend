import { payrollWorker } from './payrollWorker.js';
import { payrollScheduleWorker } from './payrollScheduleWorker.js';
import { PayrollScheduleQueueService } from '../services/payrollScheduleQueueService.js';
import logger from '../utils/logger.js';

export const startWorkers = () => {
  logger.info('Starting BullMQ workers...');

  // Workers are started when imported
  if (payrollWorker.isRunning()) {
    logger.info('Payroll worker is running');
  }
  if (payrollScheduleWorker.isRunning()) {
    logger.info('Payroll schedule dispatch worker is running');
  }

  void PayrollScheduleQueueService.ensureDispatchTickScheduled();
};
