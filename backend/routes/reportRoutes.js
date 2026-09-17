import express from 'express';
import {
  addOrUpdateReportResults,
  getReportsByBooking,
  markReportAsReady,
  generatePatientReport
} from '../controllers/reportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addOrUpdateReportResults);
router.get('/booking/:bookingId', protect, getReportsByBooking);
router.patch('/booking/:bookingId/mark-ready', protect, markReportAsReady);
router.get('/booking/:bookingId/pdf', protect, generatePatientReport);

export default router;
