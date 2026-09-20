import express from 'express';
import {
  getRevenueAnalytics,
  getTestPopularity,
  getBookingsByStatus,
  getCategoryBreakdown,
  getOverviewStats,
} from '../controllers/analyticsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/revenue', getRevenueAnalytics);
router.get('/test-popularity', getTestPopularity);
router.get('/bookings-by-status', getBookingsByStatus);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/overview', getOverviewStats);

export default router;
