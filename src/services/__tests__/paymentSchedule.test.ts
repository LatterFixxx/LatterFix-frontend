import { describe, it, expect, vi, afterEach } from 'vitest';
import { cancelSchedule, createSchedule, listSchedules } from '../paymentSchedule';

describe('paymentSchedule service', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it('createSchedule posts to /api/schedules and returns the created record', async () => {
    const created = { id: 1, status: 'active' };
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: created }), { status: 201 })
    ) as unknown as typeof fetch;

    const input = {
      frequency: 'monthly' as const,
      dayOfMonth: 1,
      timeOfDay: '09:00',
      tokenAddress: 'CTOKEN',
      recipients: [{ employeeId: 1, walletAddress: 'GABC', amount: '1000', currency: 'USDC' }],
    };
    const result = await createSchedule(input);

    expect(result).toEqual(created);
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/schedules');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(input);
  });

  it('createSchedule throws with the server error message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Missing tokenAddress' }), { status: 400 })
    ) as unknown as typeof fetch;

    await expect(
      createSchedule({
        frequency: 'weekly',
        timeOfDay: '09:00',
        tokenAddress: '',
        recipients: [],
      })
    ).rejects.toThrow('Missing tokenAddress');
  });

  it('listSchedules fetches and returns the schedule array', async () => {
    const schedules = [{ id: 1 }, { id: 2 }];
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: schedules }), { status: 200 })
    ) as unknown as typeof fetch;

    const result = await listSchedules();

    expect(result).toEqual(schedules);
  });

  it('attaches an Authorization header when a token is present in localStorage', async () => {
    localStorage.setItem('payd_auth_token', 'test-jwt');
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [] }), { status: 200 })
    ) as unknown as typeof fetch;

    await listSchedules();

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer test-jwt');
  });

  it('cancelSchedule sends a DELETE request to /api/schedules/:id', async () => {
    const cancelled = { id: 7, status: 'cancelled' };
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: cancelled }), { status: 200 })
    ) as unknown as typeof fetch;

    const result = await cancelSchedule(7);

    expect(result).toEqual(cancelled);
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/schedules/7');
    expect(options.method).toBe('DELETE');
  });
});
