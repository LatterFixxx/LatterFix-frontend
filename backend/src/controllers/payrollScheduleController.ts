import { Request, Response } from 'express';
import { PayrollScheduleService, ScheduleFrequency } from '../services/payrollScheduleService.js';
import logger from '../utils/logger.js';

const VALID_FREQUENCIES: ScheduleFrequency[] = ['weekly', 'biweekly', 'monthly'];

export class PayrollScheduleController {
  static async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ error: 'User must belong to an organization' });
        return;
      }

      const { frequency, dayOfWeek, dayOfMonth, timeOfDay, assetCode, tokenAddress, recipients } =
        req.body;

      if (!frequency || !VALID_FREQUENCIES.includes(frequency)) {
        res.status(400).json({
          error: `Missing or invalid frequency (must be one of ${VALID_FREQUENCIES.join(', ')})`,
        });
        return;
      }
      if (!timeOfDay || !tokenAddress || !Array.isArray(recipients) || recipients.length === 0) {
        res.status(400).json({
          error: 'Missing required fields: timeOfDay, tokenAddress, recipients (non-empty array)',
        });
        return;
      }

      const schedule = await PayrollScheduleService.createSchedule(organizationId, {
        frequency,
        dayOfWeek,
        dayOfMonth,
        timeOfDay,
        assetCode,
        tokenAddress,
        recipients,
      });

      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      logger.error('Failed to create payroll schedule', error);
      res.status(500).json({
        error: 'Failed to create payroll schedule',
        message: (error as Error).message,
      });
    }
  }

  static async listSchedules(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        res.status(400).json({ error: 'User must belong to an organization' });
        return;
      }

      const schedules = await PayrollScheduleService.listSchedulesForOrg(organizationId);
      res.json({ success: true, data: schedules });
    } catch (error) {
      logger.error('Failed to list payroll schedules', error);
      res.status(500).json({
        error: 'Failed to list payroll schedules',
        message: (error as Error).message,
      });
    }
  }

  static async cancelSchedule(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId;
      const { id } = req.params;
      const schedule = await PayrollScheduleService.getScheduleById(parseInt(id as string, 10));

      if (!schedule || schedule.organization_id !== organizationId) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      const cancelled = await PayrollScheduleService.cancelSchedule(schedule.id);
      res.json({ success: true, data: cancelled });
    } catch (error) {
      logger.error('Failed to cancel payroll schedule', error);
      res.status(500).json({
        error: 'Failed to cancel payroll schedule',
        message: (error as Error).message,
      });
    }
  }
}
