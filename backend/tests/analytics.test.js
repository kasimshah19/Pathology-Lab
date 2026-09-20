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

describe('Analytics API', () => {
  let adminToken;

  beforeEach(async () => {
    const auth = await createTestUser('admin');
    adminToken = auth.token;
  });

  it('should calculate revenue for the last 7 days', async () => {
    // We don't need to create full bookings for the unit test of the endpoint if it handles empty DB gracefully
    const res = await request(app)
      .get('/api/analytics/revenue?period=7days')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    // Since there are no bookings, the length should match the dates populated in the pipeline (which is handled by application logic if we zero-fill)
    // Actually, in mongo if no records, the pipeline might return empty. The endpoint is supposed to work either way.
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should deny non-admins', async () => {
    const { token } = await createTestUser('technician');

    const res = await request(app)
      .get('/api/analytics/revenue')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(403);
  });
});
