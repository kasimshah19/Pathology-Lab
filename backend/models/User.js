import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'receptionist', 'technician'],
      default: 'receptionist',
      description: 'Role defines the access level of the staff member',
    },
    phone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Determines if the staff member can log in',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);

export default User;
