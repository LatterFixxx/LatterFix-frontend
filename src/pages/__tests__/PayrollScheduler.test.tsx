import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import PayrollScheduler from '../PayrollScheduler';

const mocks = vi.hoisted(() => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  listSchedules: vi.fn(),
  createSchedule: vi.fn(),
  cancelSchedule: vi.fn(),
}));

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({ notifyError: mocks.notifyError, notifySuccess: mocks.notifySuccess }),
}));

vi.mock('../../services/paymentSchedule', () => ({
  listSchedules: mocks.listSchedules,
  createSchedule: mocks.createSchedule,
  cancelSchedule: mocks.cancelSchedule,
}));

const SAMPLE_SCHEDULE = {
  id: 1,
  organization_id: 1,
  frequency: 'monthly' as const,
  day_of_week: null,
  day_of_month: 1,
  time_of_day: '09:00',
  asset_code: 'USDC',
  token_address: 'CTOKEN',
  recipients: [{ employeeId: 1, walletAddress: 'GABC', amount: '1000', currency: 'USDC' }],
  status: 'active' as const,
  next_run_at: new Date(Date.now() + 60_000 * 60 * 24).toISOString(),
  last_run_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('PayrollScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listSchedules.mockResolvedValue([SAMPLE_SCHEDULE]);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders active schedules with a countdown', async () => {
    render(<PayrollScheduler />);

    expect(await screen.findByText(/Monthly on day 1 at 09:00/i)).toBeTruthy();
    expect(screen.getByText(/1 recipient\(s\)/i)).toBeTruthy();
  });

  it('shows an error state when loading schedules fails', async () => {
    mocks.listSchedules.mockRejectedValue(new Error('network down'));
    render(<PayrollScheduler />);

    await waitFor(() => {
      expect(mocks.notifyError).toHaveBeenCalledWith(
        'Failed to load payroll schedules',
        'network down'
      );
    });
    expect(await screen.findByText('network down')).toBeTruthy();
  });

  it('cancels a schedule and removes it from the list immediately', async () => {
    mocks.cancelSchedule.mockResolvedValue({ ...SAMPLE_SCHEDULE, status: 'cancelled' });
    render(<PayrollScheduler />);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mocks.cancelSchedule).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(screen.queryByText(/Monthly on day 1 at 09:00/i)).toBeNull();
    });
  });

  it('opens the wizard and creates a schedule on confirm', async () => {
    const created = { ...SAMPLE_SCHEDULE, id: 2 };
    mocks.createSchedule.mockResolvedValue(created);
    mocks.listSchedules.mockResolvedValue([]);
    render(<PayrollScheduler />);

    const newScheduleButton = await screen.findByRole('button', { name: /new schedule/i });
    fireEvent.click(newScheduleButton);

    expect(await screen.findByText('Step 1: Set Schedule')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm schedule/i }));

    await waitFor(() => {
      expect(mocks.createSchedule).toHaveBeenCalledTimes(1);
    });
    expect(mocks.notifySuccess).toHaveBeenCalledWith(
      'Schedule created',
      'The payroll schedule has been saved.'
    );
  });
});
