import { useEffect, useState } from 'react';
import { CalendarClock, Plus, X } from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { SchedulingWizard, type SchedulingConfig } from '../components/SchedulingWizard';
import { useNotification } from '../hooks/useNotification';
import {
  cancelSchedule,
  createSchedule,
  listSchedules,
  type PaymentSchedule,
} from '../services/paymentSchedule';

function formatFrequency(schedule: PaymentSchedule): string {
  const label = schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1);
  if (schedule.frequency === 'monthly') {
    return `${label} on day ${schedule.day_of_month ?? 1} at ${schedule.time_of_day}`;
  }
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${label} on ${days[schedule.day_of_week ?? 1]} at ${schedule.time_of_day}`;
}

export default function PayrollScheduler() {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const { notifyError, notifySuccess } = useNotification();

  useEffect(() => {
    const loadSchedules = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listSchedules();
        setSchedules(data);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load schedules';
        setError(message);
        notifyError('Failed to load payroll schedules', message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSchedules();
  }, [notifyError]);

  const handleCreateSchedule = async (config: SchedulingConfig) => {
    setIsSubmitting(true);
    try {
      const created = await createSchedule({
        frequency: config.frequency,
        dayOfWeek: config.dayOfWeek,
        dayOfMonth: config.dayOfMonth,
        timeOfDay: config.timeOfDay,
        tokenAddress: config.tokenAddress,
        recipients: config.preferences.map((pref) => ({
          employeeId: pref.employeeId,
          walletAddress: pref.walletAddress,
          amount: pref.amount,
          currency: pref.currency,
        })),
      });
      setSchedules((prev) => [...prev, created].sort((a, b) => a.next_run_at.localeCompare(b.next_run_at)));
      notifySuccess('Schedule created', 'The payroll schedule has been saved.');
      setShowWizard(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save schedule';
      notifyError('Failed to save schedule', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await cancelSchedule(id);
      // Update immediately — no need to wait for a refetch since this is a
      // direct, synchronous user action confirmed by the server response.
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
      notifySuccess('Schedule cancelled', 'The payroll schedule will no longer run.');
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : 'Failed to cancel schedule';
      notifyError('Failed to cancel schedule', message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-hi pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Payroll <span className="text-accent">Scheduler</span>
          </h1>
          <p className="text-muted font-mono text-sm tracking-wider uppercase mt-2">
            Automated distribution engine
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-accent text-bg"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {isLoading ? <p className="text-sm text-muted mb-6">Loading schedules...</p> : null}
      {error ? <p className="text-sm text-red-400 mb-6">{error}</p> : null}

      {showWizard ? (
        <div className="mb-8">
          <SchedulingWizard
            onComplete={(config) => {
              void handleCreateSchedule(config);
            }}
            onCancel={() => setShowWizard(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {!isLoading && schedules.length === 0 ? (
          <p className="text-sm text-muted">No active payroll schedules yet.</p>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="card glass noise flex flex-wrap items-center justify-between gap-4 p-6"
            >
              <div className="flex items-center gap-4">
                <CalendarClock className="w-6 h-6 text-accent shrink-0" />
                <div>
                  <p className="font-bold">{formatFrequency(schedule)}</p>
                  <p className="text-xs text-muted font-mono">
                    {schedule.recipients.length} recipient(s) &middot; {schedule.asset_code}
                  </p>
                </div>
              </div>

              <CountdownTimer targetDate={new Date(schedule.next_run_at)} />

              <button
                type="button"
                onClick={() => {
                  void handleCancel(schedule.id);
                }}
                disabled={cancellingId === schedule.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" />
                {cancellingId === schedule.id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
