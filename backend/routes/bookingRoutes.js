import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  generateInvoice,
  exportBookingsCSV
} from '../controllers/bookingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Lab test bookings and lifecycle management
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Retrieve all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - tests
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               tests:
 *                 type: string
 *                 description: JSON string array of test object IDs
 *                 example: '["60d21b4667d0d8992e610c86"]'
 *               prescription:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.route('/')
  .post(protect, upload.single('prescription'), createBooking)
  .get(protect, getAllBookings);

router.get('/export/csv', protect, authorizeRoles('admin'), exportBookingsCSV);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
 *         description: Booking found
 *   delete:
 *     summary: Delete a booking (Admin only)
 *     tags: [Bookings]
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
 *         description: Booking deleted
 */
router.route('/:id')
  .get(protect, getBookingById)
  .delete(protect, authorizeRoles('admin'), deleteBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update lifecycle status of a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, sample_collected, testing, completed]
 *                 example: sample_collected
 *     responses:
 *       200:
 *         description: Status updated
 */
router.route('/:id/status')
  .patch(protect, updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}/payment:
 *   patch:
 *     summary: Update payment status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, partial, paid]
 *                 example: paid
 *               amountPaid:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Payment updated
 */
router.route('/:id/payment')
  .patch(protect, updatePaymentStatus);

router.route('/:id/invoice')
  .get(protect, generateInvoice);

export default router;
