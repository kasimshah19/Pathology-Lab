import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Patient from './models/Patient.js';

// Load environment variables so MONGO_URI is available
dotenv.config();

const runTest = async () => {
  console.log("Connecting to database...");
  await connectDB();
  
  const sampleData = [
    { name: "Test Patient One", age: 25, gender: "male", phone: "9999999991" },
    { name: "Test Patient Two", age: 30, gender: "female", phone: "9999999992" },
    { name: "Test Patient Three", age: 40, gender: "male", phone: "9999999993" }
  ];

  try {
    for (let i = 0; i < sampleData.length; i++) {
      console.log(`Creating patient ${i + 1}...`);
      const patient = new Patient(sampleData[i]);
      await patient.save();
      console.log(`Created: ${patient.patientId}`);
    }

    console.log("\nFetching all patients from database...");
    const allPatients = await Patient.find({});
    
    // Display as a clean table format
    console.table(
      allPatients.map(p => ({
        Name: p.name,
        PatientID: p.patientId
      }))
    );
    
    console.log("\nDone! Closing database connection...");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Ensure the connection is closed and the script exits properly
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTest();
