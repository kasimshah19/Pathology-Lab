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

/**
 * @swagger
 * tags:
 *   name: Tests
 *   description: Test catalog management
 */

/**
 * @swagger
 * /api/tests:
 *   get:
 *     summary: Retrieve the test catalog
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tests
 *   post:
 *     summary: Add a new test to the catalog (Admin only)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testCode
 *               - testName
 *               - price
 *             properties:
 *               testCode:
 *                 type: string
 *                 example: CBC-01
 *               testName:
 *                 type: string
 *                 example: Complete Blood Count
 *               price:
 *                 type: number
 *                 example: 500
 *               normalRange:
 *                 type: string
 *                 example: "12-16 g/dL"
 *     responses:
 *       201:
 *         description: Test created successfully
 *       403:
 *         description: Not authorized as admin
 */
router.route('/')
  .post(protect, authorizeRoles('admin'), createTest)
  .get(protect, getAllTests);

/**
 * @swagger
 * /api/tests/{id}:
 *   get:
 *     summary: Get a test by ID
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test found
 *   put:
 *     summary: Update a test (Admin only)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Test updated
 *   delete:
 *     summary: Delete a test (Admin only)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test deleted
 */
router.route('/:id')
  .get(protect, getTestById)
  .put(protect, authorizeRoles('admin'), updateTest)
  .delete(protect, authorizeRoles('admin'), deleteTest);

export default router;
