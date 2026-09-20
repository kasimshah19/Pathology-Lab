import express from 'express';
import { 
  createPatient, 
  getAllPatients, 
  getPatientById, 
  updatePatient, 
  deletePatient,
  exportPatientsCSV,
  uploadPatientPhoto
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPatient)
  .get(protect, getAllPatients);

router.get('/export/csv', protect, authorizeRoles('admin'), exportPatientsCSV);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, authorizeRoles('admin'), deletePatient);

router.post('/:id/photo', protect, upload.single('photo'), uploadPatientPhoto);

export default router;
