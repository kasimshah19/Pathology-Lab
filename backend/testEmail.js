import dotenv from 'dotenv';
dotenv.config();
import { sendEmail } from './utils/emailService.js';

async function test() {
  console.log("Sending test email...");
  await sendEmail(
    process.env.EMAIL_USER, // Send to yourself
    'Test Email from Pathology Lab',
    '<p>This is a test email to verify Nodemailer is working.</p>'
  );
  console.log("Done testing.");
}

test();
