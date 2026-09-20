import request from 'supertest';
import app from '../server.js';
import { connect, closeDatabase, clearDatabase } from './db.js';
import { createTestUser } from './authHelper.js';
import Booking from '../models/Booking.js';
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

describe('Booking API', () => {
  let adminToken;
  let adminId;
  let patientId;

  beforeEach(async () => {
    const auth = await createTestUser('admin');
    adminToken = auth.token;
    adminId = auth.user._id;

    const patient = await Patient.create({
      patientId: 'PT-100',
      name: 'Test Patient',
      age: 25,
      gender: 'Male',
      phone: '1112223334'
    });
    patientId = patient._id;
  });

  it('should create a new booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        patient: patientId,
        tests: [],
        totalAmount: 500,
        paymentStatus: 'unpaid',
        referredBy: 'Self'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.bookingId).toBeDefined();
    expect(res.body.paymentStatus).toBe('unpaid');
  });

  it('should export bookings to CSV', async () => {
    await Booking.create({
      bookingId: 'BK-100',
      patient: patientId,
      createdBy: adminId,
      tests: [],
      totalAmount: 500,
      status: 'pending',
      paymentStatus: 'paid'
    });

    const res = await request(app)
      .get('/api/bookings/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('BK-100');
    expect(res.text).toContain('Test Patient');
  });
});
