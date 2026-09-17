import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers with 'Bearer' prefix
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token string
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token was found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user by ID from the decoded payload and attach it to req object
      // We use .select('-password') to ensure the password hash is excluded from req.user
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication middleware',
    });
  }
};

// Grant access to specific roles (higher-order function)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user exists on req and if their role is in the allowed roles array
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no role assigned',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied, insufficient permissions',
      });
    }
    
    next(); // Role is allowed, proceed to the route controller
  };
};
