import Booking from '../models/Booking.js';
import Patient from '../models/Patient.js';
import Test from '../models/Test.js';
import Report from '../models/Report.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

export const createBooking = async (req, res) => {
  try {
    const { patient, tests, referredBy } = req.body;

    // Validate patient exists
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Validate tests exist and are active
    if (!tests || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one test is required' });
    }

    const selectedTests = await Test.find({ _id: { $in: tests } });
    if (selectedTests.length !== tests.length) {
      return res.status(400).json({ success: false, message: 'One or more invalid test IDs provided' });
    }

    let totalAmount = 0;
    for (const test of selectedTests) {
      if (!test.isActive) {
        return res.status(400).json({ success: false, message: `Test ${test.testName} is not active` });
      }
      totalAmount += test.price;
    }

    const newBooking = new Booking({
      patient,
      tests,
      referredBy,
      totalAmount,
      createdBy: req.user._id,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    await newBooking.save();

    await newBooking.populate('patient', 'name');
    await newBooking.populate('tests', 'testName');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (search) {
       // Search by bookingId (exact) or patient name (regex)
       const patients = await Patient.find({ name: { $regex: search, $options: 'i' } }).select('_id');
       const patientIds = patients.map(p => p._id);
       
       query.$or = [
         { bookingId: { $regex: search, $options: 'i' } },
         { patient: { $in: patientIds } }
       ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('patient', 'name phone patientId')
      .populate('tests', 'testName price');

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patient')
      .populate('tests')
      .populate('createdBy', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'sample_collected', 'result_entered', 'report_ready', 'delivered'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'sample_collected') {
      booking.sampleCollectedAt = Date.now();
    }

    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowedPaymentStatuses = ['paid', 'unpaid', 'partial'];
    
    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status value' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await Report.deleteMany({ booking: booking._id });
    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking and associated reports deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patient')
      .populate('tests');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const pdfBuffer = await generateInvoicePDF(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${booking.bookingId || booking._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
