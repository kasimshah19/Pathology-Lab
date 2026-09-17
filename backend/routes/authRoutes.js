import express from 'express';
import {
  registerUser,
  loginUser,
  getMyProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private auth routes (require valid token)
router.get('/me', protect, getMyProfile);

// Admin only user management routes
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/status', protect, authorizeRoles('admin'), updateUserStatus);
router.patch('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);

export default router;
