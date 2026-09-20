import request from 'supertest';
import app from '../server.js';
import { connect, closeDatabase, clearDatabase } from './db.js';
import { createTestUser } from './authHelper.js';
import ActivityLog from '../models/ActivityLog.js';

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

describe('Activity Logs API', () => {
  let adminToken;
  let adminId;

  beforeEach(async () => {
    const auth = await createTestUser('admin');
    adminToken = auth.token;
    adminId = auth.user._id;
  });

  it('should allow admin to fetch activity logs', async () => {
    // Create a mock log
    await ActivityLog.create({
      action: 'TEST_ACTION',
      description: 'A test action',
      user: adminId,
      userName: 'Test admin',
      userRole: 'admin',
      targetType: 'User'
    });

    const res = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].action).toBe('TEST_ACTION');
  });

  it('should deny non-admins from fetching activity logs', async () => {
    const { token } = await createTestUser('receptionist');

    const res = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toMatch(/Not authorized/i);
  });
});
