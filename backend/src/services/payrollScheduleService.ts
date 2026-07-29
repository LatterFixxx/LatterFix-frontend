import { pool } from '../config/database.js';

export type ScheduleFrequency = 'weekly' | 'biweekly' | 'monthly';
export type ScheduleStatus = 'active' | 'cancelled';

export interface ScheduleRecipient {
  employeeId: number;
  walletAddress: string;
  amount: string;
  currency: string;
}

export interface PayrollSchedule {
  id: number;
  organization_id: number;
  frequency: ScheduleFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  asset_code: string;
  token_address: string;
  recipients: ScheduleRecipient[];
  status: ScheduleStatus;
  next_run_at: Date;
  last_run_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateScheduleInput {
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay: string;
  assetCode?: string;
  tokenAddress: string;
  recipients: ScheduleRecipient[];
}

export interface ScheduleExecutionResult {
  status: 'succeeded' | 'failed';
  txHash?: string;
  batchId?: number;
  errorMessage?: string;
}

/**
 * Computes the next timestamp (UTC) strictly after `fromDate` matching the
 * schedule's frequency/day/time pattern. Used both to seed a new schedule's
 * initial next_run_at (fromDate = now) and to advance it after each firing
 * (fromDate = the previous next_run_at) — since the previous run already
 * sits exactly on-pattern, "next occurrence strictly after it" advances by
 * exactly one period.
 *
 * Note: for `monthly` schedules, a dayOfMonth that doesn't exist in a given
 * month (e.g. 31 in February) rolls over into the following month, per
 * JavaScript Date's normal UTC overflow behavior.
 */
export function computeNextRunAt(
  config: Pick<CreateScheduleInput, 'frequency' | 'dayOfWeek' | 'dayOfMonth' | 'timeOfDay'>,
  fromDate: Date = new Date()
): Date {
  const [hours, minutes] = config.timeOfDay.split(':').map((part) => parseInt(part, 10));

  if (config.frequency === 'monthly') {
    const day = config.dayOfMonth ?? 1;
    let candidate = new Date(
      Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), day, hours, minutes, 0, 0)
    );
    while (candidate <= fromDate) {
      candidate = new Date(
        Date.UTC(candidate.getUTCFullYear(), candidate.getUTCMonth() + 1, day, hours, minutes, 0, 0)
      );
    }
    return candidate;
  }

  const targetDayOfWeek = config.dayOfWeek ?? 1;
  const stepDays = config.frequency === 'biweekly' ? 14 : 7;

  const candidate = new Date(
    Date.UTC(
      fromDate.getUTCFullYear(),
      fromDate.getUTCMonth(),
      fromDate.getUTCDate(),
      hours,
      minutes,
      0,
      0
    )
  );
  const dowDiff = (targetDayOfWeek - candidate.getUTCDay() + 7) % 7;
  candidate.setUTCDate(candidate.getUTCDate() + dowDiff);
  while (candidate <= fromDate) {
    candidate.setUTCDate(candidate.getUTCDate() + stepDays);
  }
  return candidate;
}

export class PayrollScheduleService {
  static async createSchedule(
    organizationId: number,
    input: CreateScheduleInput
  ): Promise<PayrollSchedule> {
    const nextRunAt = computeNextRunAt(input);
    const result = await pool.query(
      `INSERT INTO payroll_schedules
         (organization_id, frequency, day_of_week, day_of_month, time_of_day,
          asset_code, token_address, recipients, next_run_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        organizationId,
        input.frequency,
        input.dayOfWeek ?? null,
        input.dayOfMonth ?? null,
        input.timeOfDay,
        input.assetCode || 'XLM',
        input.tokenAddress,
        JSON.stringify(input.recipients),
        nextRunAt,
      ]
    );
    return result.rows[0];
  }

  static async listSchedulesForOrg(organizationId: number): Promise<PayrollSchedule[]> {
    const result = await pool.query(
      `SELECT * FROM payroll_schedules WHERE organization_id = $1 ORDER BY next_run_at ASC`,
      [organizationId]
    );
    return result.rows;
  }

  static async getScheduleById(id: number): Promise<PayrollSchedule | null> {
    const result = await pool.query('SELECT * FROM payroll_schedules WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async cancelSchedule(id: number): Promise<PayrollSchedule | null> {
    const result = await pool.query(
      `UPDATE payroll_schedules SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findDueSchedules(): Promise<PayrollSchedule[]> {
    const result = await pool.query(
      `SELECT * FROM payroll_schedules WHERE status = 'active' AND next_run_at <= NOW()`
    );
    return result.rows;
  }

  static async recordExecution(
    schedule: PayrollSchedule,
    result: ScheduleExecutionResult
  ): Promise<void> {
    await pool.query(
      `INSERT INTO payroll_schedule_runs (schedule_id, status, tx_hash, batch_id, error_message)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        schedule.id,
        result.status,
        result.txHash ?? null,
        result.batchId ?? null,
        result.errorMessage ?? null,
      ]
    );

    const nextRunAt = computeNextRunAt(
      {
        frequency: schedule.frequency,
        dayOfWeek: schedule.day_of_week ?? undefined,
        dayOfMonth: schedule.day_of_month ?? undefined,
        timeOfDay: schedule.time_of_day,
      },
      schedule.next_run_at
    );
    await pool.query(
      `UPDATE payroll_schedules SET last_run_at = NOW(), next_run_at = $2 WHERE id = $1`,
      [schedule.id, nextRunAt]
    );
  }
}
