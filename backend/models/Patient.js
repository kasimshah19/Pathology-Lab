import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    patientId: {
      type: String,
      unique: true,
      description: 'Auto-generated unique ID for the patient (e.g., PAT-0001)',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to auto-generate patientId
patientSchema.pre('save', async function (next) {
  // Only generate a new patientId if the document is new
  if (this.isNew) {
    try {
      // Find the last created patient to get the highest patientId
      const lastPatient = await this.constructor.findOne(
        {},
        { patientId: 1 }, // Only fetch the patientId field
        { sort: { createdAt: -1 } } // Sort by newest first
      );

      if (lastPatient && lastPatient.patientId) {
        // Extract the number part from "PAT-XXXX"
        const lastNumber = parseInt(lastPatient.patientId.split('-')[1]);
        const nextNumber = lastNumber + 1;
        // Format the new number with leading zeros (e.g., "0002")
        this.patientId = `PAT-${nextNumber.toString().padStart(4, '0')}`;
      } else {
        // If no patients exist yet, start with PAT-0001
        this.patientId = 'PAT-0001';
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
