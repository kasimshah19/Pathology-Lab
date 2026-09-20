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

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient registration and management
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Retrieve a list of all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of patients
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               age:
 *                 type: number
 *                 example: 30
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: female
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 example: 123 Main St, City
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Validation error
 */
router.route('/')
  .post(protect, createPatient)
  .get(protect, getAllPatients);

router.get('/export/csv', protect, authorizeRoles('admin'), exportPatientsCSV);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient ID
 *     responses:
 *       200:
 *         description: Patient found
 *       404:
 *         description: Patient not found
 *   put:
 *     summary: Update a patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated
 *       404:
 *         description: Patient not found
 *   delete:
 *     summary: Delete a patient (Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient ID
 *     responses:
 *       200:
 *         description: Patient deleted
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Patient not found
 */
router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, authorizeRoles('admin'), deletePatient);

router.post('/:id/photo', protect, upload.single('photo'), uploadPatientPhoto);

export default router;
