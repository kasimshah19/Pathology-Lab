import Report from '../models/Report.js';
import Booking from '../models/Booking.js';
import Test from '../models/Test.js';
import { generateReportPDF } from '../utils/pdfGenerator.js';

export const addOrUpdateReportResults = async (req, res) => {
  try {
    const { booking, results } = req.body;

    if (!booking || !results || !Array.isArray(results)) {
      return res.status(400).json({ success: false, message: 'Booking ID and results array are required' });
    }

    const bookingDoc = await Booking.findById(booking);
    if (!bookingDoc) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const savedReports = [];

    for (const item of results) {
      const { test, resultValue, remarks } = item;
      
      const testDoc = await Test.findById(test);
      if (!testDoc) continue; // Skip invalid tests
      
      let isAbnormal = false;
      if (testDoc.normalRange) {
        // Simple logic: if normalRange is "4.5-11.0"
        const rangeMatch = testDoc.normalRange.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          const value = parseFloat(resultValue);
          
          if (!isNaN(value)) {
            if (value < min || value > max) {
              isAbnormal = true;
            }
          }
        }
      }

      const reportData = {
        resultValue,
        isAbnormal,
        remarks: remarks || '',
        enteredBy: req.user._id
      };

      const existingReport = await Report.findOne({ booking, test });
      
      if (existingReport) {
        existingReport.resultValue = reportData.resultValue;
        existingReport.isAbnormal = reportData.isAbnormal;
        existingReport.remarks = reportData.remarks;
        existingReport.enteredBy = reportData.enteredBy;
        await existingReport.save();
        savedReports.push(existingReport);
      } else {
        const newReport = new Report({
          booking,
          test,
          ...reportData
        });
        await newReport.save();
        savedReports.push(newReport);
      }
    }

    // Update parent booking status to result_entered
    bookingDoc.status = 'result_entered';
    await bookingDoc.save();

    res.status(200).json({
      success: true,
      message: 'Report results saved successfully',
      data: savedReports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const reports = await Report.find({ booking: bookingId })
      .populate('test', 'testName unit normalRange')
      .populate('enteredBy', 'name');

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markReportAsReady = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const reports = await Report.find({ booking: bookingId });
    const reportedTestIds = reports.map(r => r.test.toString());

    const missingTests = [];
    
    for (const testId of booking.tests) {
      if (!reportedTestIds.includes(testId.toString())) {
        const testDoc = await Test.findById(testId);
        missingTests.push(testDoc ? testDoc.testName : testId);
      }
    }

    if (missingTests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All test results must be entered before marking report as ready',
        pendingTests: missingTests
      });
    }

    booking.status = 'report_ready';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking marked as report ready',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePatientReport = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('patient').populate('tests');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'report_ready' && booking.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Report is not ready yet' });
    }

    const reports = await Report.find({ booking: bookingId }).populate('test');

    const pdfBuffer = await generateReportPDF(booking, reports);

    if (booking.status === 'report_ready') {
      booking.status = 'delivered';
      await booking.save();
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=report-${booking.bookingId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
