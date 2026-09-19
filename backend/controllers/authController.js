import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for now)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    // Construct user object to return without the password field
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated, contact admin",
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token valid for 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    const user = req.user;
    
    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// @desc    Get all users (staff)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/auth/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    userToUpdate.isActive = isActive;
    await userToUpdate.save();

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        isActive: userToUpdate.isActive,
      }
    });
  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};

// @desc    Update user role
// @route   PATCH /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.toString() === req.params.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    if (!['admin', 'receptionist', 'technician'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        role: userToUpdate.role,
      }
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user role",
    });
  }
};

// @desc    Update user basic details (name, email, phone)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUserDetails = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userToUpdate._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      userToUpdate.email = email;
    }

    if (name) userToUpdate.name = name;
    if (phone !== undefined) userToUpdate.phone = phone;

    await userToUpdate.save();

    return res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        phone: userToUpdate.phone,
        role: userToUpdate.role,
        isActive: userToUpdate.isActive,
      }
    });
  } catch (error) {
    console.error("Update User Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user details",
    });
  }
};

// @desc    Change logged-in user password
// @route   PATCH /api/auth/change-password
// @access  Private (All Roles)
export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // req.user is populated by protect middleware. Re-fetch user to get the password field (since some queries might exclude it, although protect usually includes it. Let's explicitly find to be safe)
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};
