import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import { createTestUser } from './helpers.js';
import bcrypt from 'bcryptjs';

describe('Auth API Endpoints', () => {
  const validRegistrationData = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
    role: 'receptionist'
  };

  describe('POST /api/auth/register', () => {
    it('should create a new user with valid data and return 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validRegistrationData.email);
      
      // Verify user was saved in DB
      const userInDb = await User.findOne({ email: validRegistrationData.email });
      expect(userInDb).toBeTruthy();
    });

    it('should fail with 400 or 409 if email already exists', async () => {
      // First create the user
      await User.create(validRegistrationData);

      // Try to create again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect([400, 409]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });

    it('should fail with validation error if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Only Name' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validRegistrationData.password, salt);
      await User.create({ ...validRegistrationData, password: hashedPassword });
    });

    it('should successfully log in with correct credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validRegistrationData.email,
          password: validRegistrationData.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with 400 or 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validRegistrationData.email,
          password: 'wrongpassword'
        });

      expect([400, 401]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });

    it('should fail for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123'
        });

      expect([400, 401, 404]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });

    it('should fail for a deactivated account', async () => {
      await User.create({
        name: 'Inactive',
        email: 'inactive@example.com',
        password: 'password123',
        isActive: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123'
        });

      expect([401, 403]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should successfully return user profile when a valid token is provided', async () => {
      const { user, token } = await createTestUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });

    it('should fail with 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 401 when an invalid/malformed token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer invalid.token.here`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
