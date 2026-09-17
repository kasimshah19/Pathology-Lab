import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Patient from './models/Patient.js';

// Load environment variables so MONGO_URI is available
dotenv.config();

const cleanup = async () => {
  console.log("Connecting to database for cleanup...");
  await connectDB();

  try {
    console.log('Finding test patients with phone starting with "999999999"...');
    
    // Delete all patients where the phone number starts with 999999999
    const result = await Patient.deleteMany({ phone: { $regex: /^999999999/ } });
    
    console.log(`Successfully deleted ${result.deletedCount} test patient(s).`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    console.log("Closing database connection...");
    await mongoose.connection.close();
    process.exit(0);
  }
};

cleanup();
