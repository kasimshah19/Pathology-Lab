import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const createTestUser = async (role = 'admin') => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  // Create a user directly in the database to avoid relying on the register route for all tests
  const user = await User.create({
    name: `Test ${role}`,
    email: `test${Date.now()}@example.com`,
    password: hashedPassword,
    role: role,
    isActive: true
  });
  
  // Generate a valid token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  return { user, token };
};

export const createTestPatient = async (token) => {
  // Use the API to create a patient so it goes through standard validation and hooks
  const res = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Patient',
      age: 30,
      gender: 'male',
      phone: '1234567890'
    });
    
  return res.body.data;
};
