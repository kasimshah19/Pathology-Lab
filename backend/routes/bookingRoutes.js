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

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, getAllBookings);

router.get('/export/csv', protect, authorizeRoles('admin'), exportBookingsCSV);

router.route('/:id')
  .get(protect, getBookingById)
  .delete(protect, authorizeRoles('admin'), deleteBooking);

router.route('/:id/status')
  .patch(protect, updateBookingStatus);

router.route('/:id/payment')
  .patch(protect, updatePaymentStatus);

router.route('/:id/invoice')
  .get(protect, generateInvoice);

export default router;
