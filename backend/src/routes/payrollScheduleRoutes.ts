import { Router } from 'express';
import { PayrollScheduleController } from '../controllers/payrollScheduleController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payroll Schedules
 *   description: Recurring payroll schedule configuration
 */

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a recurring payroll schedule
 *     tags: [Payroll Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticateJWT, PayrollScheduleController.createSchedule);

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: List payroll schedules for the signed-in organization
 *     tags: [Payroll Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticateJWT, PayrollScheduleController.listSchedules);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Cancel a payroll schedule
 *     tags: [Payroll Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', authenticateJWT, PayrollScheduleController.cancelSchedule);

export default router;
