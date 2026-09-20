import request from 'supertest';
import app from '../server.js';
import { connect, closeDatabase, clearDatabase } from './db.js';
import { createTestUser } from './authHelper.js';
import Patient from '../models/Patient.js';

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Patient API', () => {
  let adminToken;

  beforeEach(async () => {
    const auth = await createTestUser('admin');
    adminToken = auth.token;
  });

  it('should create a new patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        phone: '1234567890'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('John Doe');
    expect(res.body.patientId).toBeDefined();
  });

  it('should export patients as CSV', async () => {
    await Patient.create({
      patientId: 'PT-1234',
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      phone: '0987654321'
    });

    const res = await request(app)
      .get('/api/patients/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Jane Smith');
    expect(res.text).toContain('=\"0987654321\"'); // Excel force-text formatting
  });
});
