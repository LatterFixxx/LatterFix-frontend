const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';

export type ScheduleFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface ScheduleRecipient {
  employeeId: number;
  walletAddress: string;
  amount: string;
  currency: string;
}

export interface PaymentSchedule {
  id: number;
  organization_id: number;
  frequency: ScheduleFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  asset_code: string;
  token_address: string;
  recipients: ScheduleRecipient[];
  status: 'active' | 'cancelled';
  next_run_at: string;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
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

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function scheduleAuthHeaders(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  const token = localStorage.getItem('payd_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createSchedule(input: CreateScheduleInput): Promise<PaymentSchedule> {
  const response = await fetch(`${normalizeBaseUrl(API_BASE_URL)}/api/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...scheduleAuthHeaders() },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as { success?: boolean; data?: PaymentSchedule; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `Failed to create schedule (${response.status})`);
  }
  return payload.data as PaymentSchedule;
}

export async function listSchedules(): Promise<PaymentSchedule[]> {
  const response = await fetch(`${normalizeBaseUrl(API_BASE_URL)}/api/schedules`, {
    headers: scheduleAuthHeaders(),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: PaymentSchedule[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error || `Failed to list schedules (${response.status})`);
  }
  return payload.data || [];
}

export async function cancelSchedule(id: number): Promise<PaymentSchedule> {
  const response = await fetch(`${normalizeBaseUrl(API_BASE_URL)}/api/schedules/${id}`, {
    method: 'DELETE',
    headers: scheduleAuthHeaders(),
  });

  const payload = (await response.json()) as { success?: boolean; data?: PaymentSchedule; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `Failed to cancel schedule (${response.status})`);
  }
  return payload.data as PaymentSchedule;
}
