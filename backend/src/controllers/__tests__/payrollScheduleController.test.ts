import request from 'supertest';
import express from 'express';

jest.mock('../../config/env', () => ({
  config: {
    DATABASE_URL: 'postgres://mock',
    PORT: 3000,
    JWT_SECRET: 'test-secret',
  },
}));

jest.mock('../../middlewares/auth.js', () => ({
  authenticateJWT: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = {
      id: 1,
      walletAddress: 'GTESTWALLET',
      email: 'employer@test.com',
      organizationId: 1,
      role: 'EMPLOYER',
    };
    next();
  },
}));

import payrollScheduleRoutes from '../../routes/payrollScheduleRoutes.js';
import { PayrollScheduleService } from '../../services/payrollScheduleService.js';

jest.mock('../../services/payrollScheduleService.js', () => ({
  PayrollScheduleService: {
    createSchedule: jest.fn(),
    listSchedulesForOrg: jest.fn(),
    getScheduleById: jest.fn(),
    cancelSchedule: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/schedules', payrollScheduleRoutes);

const validBody = {
  frequency: 'monthly',
  dayOfMonth: 1,
  timeOfDay: '09:00',
  tokenAddress: 'CTOKENADDRESS',
  recipients: [{ employeeId: 1, walletAddress: 'GRECIPIENT', amount: '1000', currency: 'USDC' }],
};

describe('PayrollScheduleController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/schedules', () => {
    it('creates a schedule and returns 201', async () => {
      const created = { id: 1, organization_id: 1, ...validBody };
      (PayrollScheduleService.createSchedule as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/schedules').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(created);
      expect(PayrollScheduleService.createSchedule).toHaveBeenCalledWith(1, validBody);
    });

    it('returns 400 for an invalid frequency', async () => {
      const res = await request(app)
        .post('/api/schedules')
        .send({ ...validBody, frequency: 'daily' });

      expect(res.status).toBe(400);
      expect(PayrollScheduleService.createSchedule).not.toHaveBeenCalled();
    });

    it('returns 400 when recipients is empty', async () => {
      const res = await request(app).post('/api/schedules').send({ ...validBody, recipients: [] });

      expect(res.status).toBe(400);
      expect(PayrollScheduleService.createSchedule).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/schedules', () => {
    it('lists schedules for the signed-in organization', async () => {
      const schedules = [{ id: 1, organization_id: 1 }];
      (PayrollScheduleService.listSchedulesForOrg as jest.Mock).mockResolvedValue(schedules);

      const res = await request(app).get('/api/schedules');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(schedules);
      expect(PayrollScheduleService.listSchedulesForOrg).toHaveBeenCalledWith(1);
    });
  });

  describe('DELETE /api/schedules/:id', () => {
    it('cancels a schedule belonging to the caller organization', async () => {
      (PayrollScheduleService.getScheduleById as jest.Mock).mockResolvedValue({
        id: 5,
        organization_id: 1,
      });
      (PayrollScheduleService.cancelSchedule as jest.Mock).mockResolvedValue({
        id: 5,
        organization_id: 1,
        status: 'cancelled',
      });

      const res = await request(app).delete('/api/schedules/5');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
      expect(PayrollScheduleService.cancelSchedule).toHaveBeenCalledWith(5);
    });

    it('returns 404 when the schedule belongs to a different organization', async () => {
      (PayrollScheduleService.getScheduleById as jest.Mock).mockResolvedValue({
        id: 5,
        organization_id: 2,
      });

      const res = await request(app).delete('/api/schedules/5');

      expect(res.status).toBe(404);
      expect(PayrollScheduleService.cancelSchedule).not.toHaveBeenCalled();
    });

    it('returns 404 when the schedule does not exist', async () => {
      (PayrollScheduleService.getScheduleById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/schedules/999');

      expect(res.status).toBe(404);
    });
  });
});
