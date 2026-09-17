import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: [true, 'Test name is required (e.g. Complete Blood Count)'],
    },
    testCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values if not provided
      description: 'Unique shorthand code for the test',
    },
    category: {
      type: String,
      description: 'Category of the test (e.g. Blood, Urine, Hormone)',
    },
    price: {
      type: Number,
      required: [true, 'Test price is required'],
    },
    normalRange: {
      type: String,
      description: 'Expected normal range for the test result (e.g. 4.5-11.0 x10^9/L)',
    },
    unit: {
      type: String,
      description: 'Unit of measurement for the test result (e.g. mg/dL, x10^9/L)',
    },
    sampleType: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'other'],
      description: 'Type of biological sample required for this test',
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Determines if this test is currently offered by the lab',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Test = mongoose.model('Test', testSchema);

export default Test;
