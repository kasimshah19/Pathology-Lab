import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Test from '../models/Test.js';
import Booking from '../models/Booking.js';
import { createTestUser, createTestPatient } from './helpers.js';

describe('Booking API Endpoints', () => {
  let adminToken;
  let patientId;
  let activeTestId1;
  let activeTestId2;
  let inactiveTestId;
  const nonExistentId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    // 1. Setup Auth
    const adminUser = await createTestUser('admin');
    adminToken = adminUser.token;

    // 2. Setup Patient
    const patient = await createTestPatient(adminToken);
    patientId = patient._id;

    // 3. Setup Tests
    const test1 = await Test.create({
      testName: 'Complete Blood Count',
      price: 500,
      isActive: true
    });
    activeTestId1 = test1._id;

    const test2 = await Test.create({
      testName: 'Lipid Profile',
      price: 800,
      isActive: true
    });
    activeTestId2 = test2._id;

    const test3 = await Test.create({
      testName: 'Old Test',
      price: 300,
      isActive: false
    });
    inactiveTestId = test3._id;
  });

  describe('POST /api/bookings', () => {
    it('should create a booking with valid patient and tests, calculating correct totalAmount', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: patientId,
          tests: [activeTestId1, activeTestId2]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      // The amount should be calculated by backend (500 + 800 = 1300)
      expect(res.body.data.totalAmount).toBe(1300);
      expect(res.body.data.status).toBe('pending');
    });

    it('should fail with 404 if the patient id does not exist', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: nonExistentId,
          tests: [activeTestId1]
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should fail with an error if a test id does not exist', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: patientId,
          tests: [activeTestId1, nonExistentId]
        });

      expect(res.statusCode).not.toBe(201);
      expect(res.body.success).toBe(false);
    });

    it('should fail with an error if a test id is inactive', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: patientId,
          tests: [activeTestId1, inactiveTestId]
        });

      expect(res.statusCode).not.toBe(201);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/bookings/:id/status', () => {
    let bookingId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: patientId,
          tests: [activeTestId1]
        });
      bookingId = res.body.data._id;
    });

    it('should successfully update status to a valid value', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'sample_collected' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('sample_collected');
    });

    it('should fail when given an invalid status value', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      // Should be 400 Bad Request or a validation error (500 if unhandled)
      expect(res.statusCode).not.toBe(200);
      expect(res.body.success).toBe(false);
    });
  });
});
