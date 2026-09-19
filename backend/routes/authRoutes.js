import express from 'express';
import {
  registerUser,
  loginUser,
  getMyProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserDetails,
  changeMyPassword,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private auth routes (require valid token)
router.get('/me', protect, getMyProfile);
router.patch('/change-password', protect, changeMyPassword);

// Admin only user management routes
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/status', protect, authorizeRoles('admin'), updateUserStatus);
router.patch('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.put('/users/:id', protect, authorizeRoles('admin'), updateUserDetails);

export default router;
