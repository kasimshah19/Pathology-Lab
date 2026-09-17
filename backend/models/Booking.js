import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required for a booking'],
    },
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: [true, 'At least one test must be assigned to the booking'],
      },
    ],
    bookingId: {
      type: String,
      unique: true,
      description: 'Auto-generated unique ID for the booking (e.g., BK-0001)',
    },
    status: {
      type: String,
      enum: ['pending', 'sample_collected', 'result_entered', 'report_ready', 'delivered'],
      default: 'pending',
      description: 'Current lifecycle status of the booking',
    },
    sampleCollectedAt: {
      type: Date,
      description: 'Timestamp for when the sample was physically collected',
    },
    totalAmount: {
      type: Number,
      description: 'Calculated total price for all assigned tests',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'partial'],
      default: 'unpaid',
      description: 'Current payment status of the booking',
    },
    referredBy: {
      type: String,
      description: 'Name of the doctor or hospital that referred the patient (if applicable)',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'Reference to the staff member (receptionist/admin) who created this booking',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to auto-generate bookingId
bookingSchema.pre('save', async function (next) {
  // Only generate a new bookingId if the document is new
  if (this.isNew) {
    try {
      // Find the last created booking to get the highest bookingId
      const lastBooking = await this.constructor.findOne(
        {},
        { bookingId: 1 }, // Only fetch the bookingId field
        { sort: { createdAt: -1 } } // Sort by newest first
      );

      if (lastBooking && lastBooking.bookingId) {
        // Extract the number part from "BK-XXXX"
        const lastNumber = parseInt(lastBooking.bookingId.split('-')[1]);
        const nextNumber = lastNumber + 1;
        // Format the new number with leading zeros (e.g., "0002")
        this.bookingId = `BK-${nextNumber.toString().padStart(4, '0')}`;
      } else {
        // If no bookings exist yet, start with BK-0001
        this.bookingId = 'BK-0001';
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
