import express from 'express';
import {
  addOrUpdateReportResults,
  getReportsByBooking,
  markReportAsReady,
  generatePatientReport
} from '../controllers/reportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Test result entry and PDF report generation
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Enter or update test results for a booking
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking
 *               - results
 *             properties:
 *               booking:
 *                 type: string
 *                 description: Booking ID
 *                 example: 60d21b4667d0d8992e610c85
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     test:
 *                       type: string
 *                       description: Test ID
 *                       example: 60d21b4667d0d8992e610c86
 *                     resultValue:
 *                       type: string
 *                       example: "14.5"
 *                     isAbnormal:
 *                       type: boolean
 *                       example: false
 *                     remarks:
 *                       type: string
 *                       example: "Normal range"
 *     responses:
 *       200:
 *         description: Results saved successfully
 */
router.post('/', protect, addOrUpdateReportResults);

/**
 * @swagger
 * /api/reports/booking/{bookingId}:
 *   get:
 *     summary: Get all entered reports for a specific booking
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/booking/:bookingId', protect, getReportsByBooking);

/**
 * @swagger
 * /api/reports/booking/{bookingId}/mark-ready:
 *   patch:
 *     summary: Mark all reports for a booking as ready (completed)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking marked as completed and reports ready
 */
router.patch('/booking/:bookingId/mark-ready', protect, markReportAsReady);

/**
 * @swagger
 * /api/reports/booking/{bookingId}/pdf:
 *   get:
 *     summary: Generate and stream the final PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/booking/:bookingId/pdf', protect, generatePatientReport);

export default router;
