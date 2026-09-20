import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send an email asynchronously without crashing the app on failure.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML body of the email
 */
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('Email not configured, skipping notification');
      return;
    }

    const info = await transporter.sendMail({
      from: `"Al-Hayat Diagnostic Lab" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
};

/**
 * Generates the HTML for a booking confirmation email.
 * Format: Booking Confirmation - [Booking ID]
 */
export const getBookingConfirmationEmail = (patientName, bookingId, testsListString, totalAmount) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0d9488; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">Al-Hayat Diagnostic Lab</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your tests have been successfully booked. Here are your booking details:</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
          <p style="margin: 5px 0;"><strong>Tests Booked:</strong> ${testsListString}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${totalAmount}</p>
        </div>
        <p>Thank you for choosing Al-Hayat Diagnostic Lab.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;
};

/**
 * Generates the HTML for a report ready email.
 */
export const getReportReadyEmail = (patientName, bookingId) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0d9488; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">Al-Hayat Diagnostic Lab</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your lab report for Booking ID <strong>${bookingId}</strong> is now ready.</p>
        <p>You can visit the lab to collect your physical report, or contact us if you need further details.</p>
        <p>Thank you for choosing Al-Hayat Diagnostic Lab for your diagnostic needs.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;
};
