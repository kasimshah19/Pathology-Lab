import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const cleanupAuth = async () => {
  console.log("Connecting to database to clean up auth tests...");
  await connectDB();

  try {
    console.log('Finding test users created by testAuth.js...');
    
    // Delete all users whose email starts with "admin_" and phone is "9876543210"
    const result = await User.deleteMany({ 
      email: { $regex: /^admin_/ },
      phone: "9876543210" 
    });
    
    console.log(`Successfully deleted ${result.deletedCount} test user(s).`);
  } catch (error) {
    console.error("Error during auth cleanup:", error);
  } finally {
    console.log("Closing database connection...");
    await mongoose.connection.close();
    process.exit(0);
  }
};

cleanupAuth();
