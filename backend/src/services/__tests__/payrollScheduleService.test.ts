import { computeNextRunAt } from '../payrollScheduleService.js';

describe('computeNextRunAt', () => {
  it('computes the next weekly occurrence strictly after fromDate', () => {
    // 2024-01-01 is a Monday (UTC).
    const fromDate = new Date('2024-01-01T00:00:00Z');
    const next = computeNextRunAt(
      { frequency: 'weekly', dayOfWeek: 3, timeOfDay: '09:00' }, // Wednesday
      fromDate
    );
    expect(next.toISOString()).toBe('2024-01-03T09:00:00.000Z');
  });

  it('rolls over to the following week when the target day/time has already passed', () => {
    // 2024-01-03 is a Wednesday; requesting Wednesday again from a point
    // after 09:00 that same day must roll forward a full week, not repeat
    // the same day.
    const fromDate = new Date('2024-01-03T10:00:00Z');
    const next = computeNextRunAt(
      { frequency: 'weekly', dayOfWeek: 3, timeOfDay: '09:00' },
      fromDate
    );
    expect(next.toISOString()).toBe('2024-01-10T09:00:00.000Z');
  });

  it('steps forward by 14 days for biweekly schedules', () => {
    const fromDate = new Date('2024-01-03T09:00:00Z'); // exactly on-pattern
    const next = computeNextRunAt(
      { frequency: 'biweekly', dayOfWeek: 3, timeOfDay: '09:00' },
      fromDate
    );
    expect(next.toISOString()).toBe('2024-01-17T09:00:00.000Z');
  });

  it('computes the next monthly occurrence on the given day of month', () => {
    const fromDate = new Date('2024-01-15T00:00:00Z');
    const next = computeNextRunAt(
      { frequency: 'monthly', dayOfMonth: 1, timeOfDay: '09:00' },
      fromDate
    );
    expect(next.toISOString()).toBe('2024-02-01T09:00:00.000Z');
  });

  it('advances monthly schedules by exactly one month when rescheduling from the previous run', () => {
    const previousRun = new Date('2024-02-01T09:00:00Z');
    const next = computeNextRunAt(
      { frequency: 'monthly', dayOfMonth: 1, timeOfDay: '09:00' },
      previousRun
    );
    expect(next.toISOString()).toBe('2024-03-01T09:00:00.000Z');
  });

  it('defaults to day 1 / Monday when dayOfMonth/dayOfWeek are omitted', () => {
    // fromDate is midnight on the 1st, so 09:00 on that same 1st is still
    // strictly after fromDate — no rollover to the next month/week expected.
    const fromDate = new Date('2024-01-01T00:00:00Z');
    const monthly = computeNextRunAt({ frequency: 'monthly', timeOfDay: '09:00' }, fromDate);
    expect(monthly.toISOString()).toBe('2024-01-01T09:00:00.000Z');

    const weekly = computeNextRunAt({ frequency: 'weekly', timeOfDay: '09:00' }, fromDate);
    expect(weekly.toISOString()).toBe('2024-01-01T09:00:00.000Z');
  });
});
