import request from 'supertest';
import app from '../server.js';
import Patient from '../models/Patient.js';
import { createTestUser, createTestPatient } from './helpers.js';

describe('Patient API Endpoints', () => {
  let adminToken;
  let receptionistToken;

  beforeEach(async () => {
    const adminUser = await createTestUser('admin');
    adminToken = adminUser.token;

    const receptionistUser = await createTestUser('receptionist');
    receptionistToken = receptionistUser.token;
  });

  describe('POST /api/patients', () => {
    const validPatientData = {
      name: 'John Doe',
      age: 45,
      gender: 'male',
      phone: '9876543210'
    };

    it('should successfully create a patient when authenticated', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPatientData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validPatientData.name);
    });

    it('should fail with 401 if no auth token provided', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send(validPatientData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should correctly auto-generate the sequential patientId', async () => {
      const res1 = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPatientData, name: 'First Patient' });

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data.patientId).toBe('PAT-0001');

      const res2 = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPatientData, name: 'Second Patient' });

      expect(res2.statusCode).toBe(201);
      expect(res2.body.data.patientId).toBe('PAT-0002');
    });
  });

  describe('GET /api/patients', () => {
    it('should successfully return a list of patients when authenticated', async () => {
      // Create a test patient first
      await createTestPatient(adminToken);

      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.patients)).toBe(true);
      expect(res.body.data.patients.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    let patientId;

    beforeEach(async () => {
      const patient = await createTestPatient(adminToken);
      patientId = patient._id;
    });

    it('should fail with 403 when a non-admin role tries to delete', async () => {
      const res = await request(app)
        .delete(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should succeed when an admin tries to delete', async () => {
      const res = await request(app)
        .delete(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const deletedPatient = await Patient.findById(patientId);
      expect(deletedPatient).toBeNull();
    });
  });
});
