import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin'), getActivityLogs);

export default router;
