import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const createTestUser = async (role = 'admin') => {
  const user = await User.create({
    name: 'Test ' + role,
    email: `${role}@test.com`,
    password: 'password123',
    phone: '1234567890',
    role
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '1h'
  });

  return { user, token };
};
