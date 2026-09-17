import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Report must be linked to a specific booking'],
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Report must be linked to a specific test'],
    },
    resultValue: {
      type: String,
      required: [true, 'Actual result value is required'],
    },
    isAbnormal: {
      type: Boolean,
      default: false,
      description: 'Flag indicating if the result falls outside the normal range',
    },
    remarks: {
      type: String,
      description: 'Any additional notes or interpretation from the technician/pathologist',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'Reference to the technician who entered this result',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
