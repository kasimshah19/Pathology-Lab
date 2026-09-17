import express from 'express';
import { 
  createTest, 
  getAllTests, 
  getTestById, 
  updateTest, 
  deleteTest 
} from '../controllers/testController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('admin'), createTest)
  .get(protect, getAllTests);

router.route('/:id')
  .get(protect, getTestById)
  .put(protect, authorizeRoles('admin'), updateTest)
  .delete(protect, authorizeRoles('admin'), deleteTest);

export default router;
