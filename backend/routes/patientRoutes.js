import express from 'express';
import { 
  createPatient, 
  getAllPatients, 
  getPatientById, 
  updatePatient, 
  deletePatient 
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPatient)
  .get(protect, getAllPatients);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, authorizeRoles('admin'), deletePatient);

export default router;
