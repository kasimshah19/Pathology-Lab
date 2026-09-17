import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export const generateReportPDF = async (bookingData, reportsData) => {
  const pdfDoc = await PDFDocument.create();

  // Embed standard fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Colors
  const primaryTeal = rgb(0.05, 0.35, 0.38); // approx #0d5c63
  const goldAccent = rgb(0.83, 0.68, 0.21); // approx #D4AF37
  const lightTealBg = rgb(0.95, 0.97, 0.97);
  const white = rgb(1, 1, 1);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const veryLightGray = rgb(0.97, 0.97, 0.97);
  const dividerGray = rgb(0.85, 0.85, 0.85);

  // Status Badge Colors
  const normalBg = rgb(0.86, 0.98, 0.86);
  const normalText = rgb(0.1, 0.5, 0.2);
  const abnormalBg = rgb(1, 0.9, 0.9);
  const abnormalText = rgb(0.7, 0.1, 0.1);

  // Layout metrics
  const marginX = 45;
  const pageWidth = 595.28; // A4 Width
  const pageHeight = 841.89; // A4 Height
  const usableWidth = pageWidth - marginX * 2;

  const p = bookingData.patient || {};
  const dateStr = new Date(bookingData.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const sampleDateStr = bookingData.sampleCollectedAt ? new Date(bookingData.sampleCollectedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : dateStr;
  const bookingIdStr = bookingData.bookingId || '-';
  const reportNo = `RPT-${bookingIdStr}-${Date.now().toString().slice(-6)}`;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  // Helper function to draw text
  const drawText = (currentPage, text, x, posY, size, fontType, color = darkGray) => {
    currentPage.drawText(text, { x, y: posY, size, font: fontType, color });
  };

  const drawPageDecorations = (currentPage) => {
    // 3. Page Border
    currentPage.drawRectangle({
      x: 15, y: 15,
      width: pageWidth - 30, height: pageHeight - 30,
      borderColor: primaryTeal, borderWidth: 1.5,
    });
    
  };

  // Helper to draw Header and Patient Info
  const createHeaderAndPatientInfo = (currentPage) => {
    y = pageHeight;
    drawPageDecorations(currentPage);
    
    // --- 1. LAB BRANDING (Header Band) ---
    const headerHeight = 95;
    currentPage.drawRectangle({
      x: 15,
      y: y - headerHeight - 15, // Adjusted for border
      width: pageWidth - 30,
      height: headerHeight,
      color: primaryTeal,
    });
    
    // 7. Gold Accent Line
    currentPage.drawRectangle({
      x: 15,
      y: y - headerHeight - 18,
      width: pageWidth - 30,
      height: 3,
      color: goldAccent,
    });
    
    y -= 55;
    drawText(currentPage, 'Al-Hayat Diagnostic Lab', marginX, y, 26, boldFont, white);
    // 5. Report ID
    drawText(currentPage, `Report No: ${reportNo}`, pageWidth - marginX - 160, y, 11, boldFont, goldAccent);
    
    y -= 25;
    drawText(currentPage, '123 Health Avenue, Medical District, City - 10001 | Contact: +1-800-ALHAYAT', marginX, y, 10, font, rgb(0.9, 0.9, 0.9));
    
    y -= 50; // Space below header

    // --- 3. PATIENT INFO SECTION ---
    const boxHeight = 100;
    y -= boxHeight;
    currentPage.drawRectangle({
      x: marginX,
      y: y,
      width: usableWidth,
      height: boxHeight,
      color: lightTealBg,
    });

    const infoYStart = y + boxHeight - 20;
    
    // Left column
    drawText(currentPage, 'Patient Name:', marginX + 15, infoYStart, 10, font, darkGray);
    drawText(currentPage, p.name || '-', marginX + 90, infoYStart, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Age/Sex:', marginX + 15, infoYStart - 22, 10, font, darkGray);
    drawText(currentPage, `${p.age || '-'} Y / ${p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : '-'}`, marginX + 90, infoYStart - 22, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Patient ID:', marginX + 15, infoYStart - 44, 10, font, darkGray);
    drawText(currentPage, p.patientId || '-', marginX + 90, infoYStart - 44, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Referred By:', marginX + 15, infoYStart - 66, 10, font, darkGray);
    drawText(currentPage, bookingData.referredBy || 'Self', marginX + 90, infoYStart - 66, 11, boldFont, darkGray);
    
    // Right column
    const rightColX = marginX + 270;
    
    // 1. Fixing Booking ID from booking._id to booking.bookingId
    drawText(currentPage, 'Booking ID:', rightColX, infoYStart, 10, font, darkGray);
    drawText(currentPage, bookingIdStr, rightColX + 90, infoYStart, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Booking Date:', rightColX, infoYStart - 22, 10, font, darkGray);
    drawText(currentPage, dateStr, rightColX + 90, infoYStart - 22, 11, boldFont, darkGray);
    
    // 6. Sample Collection Date
    drawText(currentPage, 'Sample Date:', rightColX, infoYStart - 44, 10, font, darkGray);
    drawText(currentPage, sampleDateStr, rightColX + 90, infoYStart - 44, 11, boldFont, darkGray);

    y -= 25;
    // --- 2. DIVIDER LINE ---
    currentPage.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 1.5, color: primaryTeal });
    y -= 25;
  };

  // Helper to draw footer
  const drawFooter = (currentPage) => {
    const footerY = 50;
    // Divider line above footer
    currentPage.drawLine({ start: { x: marginX, y: footerY + 50 }, end: { x: pageWidth - marginX, y: footerY + 50 }, thickness: 1.5, color: primaryTeal });
    
    // 2. Fix footer overlap (Left-aligned disclaimer, clearly separated)
    const footerText = 'This is a computer generated report and does not require a physical signature.';
    currentPage.drawText(footerText, { 
      x: marginX, y: footerY + 20, size: 9, font: italicFont, color: rgb(0.5, 0.5, 0.5) 
    });
    
    // Authorized Signatory block (bottom right with proper gap)
    const sigX = pageWidth - marginX - 130;
    // Line ABOVE text, with 20pt gap
    currentPage.drawLine({ start: { x: sigX, y: footerY + 35 }, end: { x: sigX + 130, y: footerY + 35 }, thickness: 1, color: darkGray });
    currentPage.drawText('Authorized Signatory', { x: sigX + 12, y: footerY + 15, size: 10, font: boldFont, color: darkGray });
  };

  // Initialize first page header
  createHeaderAndPatientInfo(page);

  // --- 4. TEST RESULTS TABLE HEADER ---
  const tableHeaderHeight = 25;
  const drawTableHeader = (currentPage) => {
    currentPage.drawRectangle({
      x: marginX,
      y: y - tableHeaderHeight,
      width: usableWidth,
      height: tableHeaderHeight,
      color: primaryTeal,
    });

    const colX = [marginX + 10, marginX + 160, marginX + 240, marginX + 320, marginX + 420];
    
    const headerY = y - 17;
    drawText(currentPage, 'Test Name', colX[0], headerY, 10, boldFont, white);
    drawText(currentPage, 'Result', colX[1], headerY, 10, boldFont, white);
    drawText(currentPage, 'Unit', colX[2], headerY, 10, boldFont, white);
    drawText(currentPage, 'Normal Range', colX[3], headerY, 10, boldFont, white);
    drawText(currentPage, 'Status', colX[4], headerY, 10, boldFont, white);
    
    y -= tableHeaderHeight;
  };

  drawTableHeader(page);

  // --- TABLE ROWS ---
  let isEven = false;
  const colX = [marginX + 10, marginX + 160, marginX + 240, marginX + 320, marginX + 420];
  
  for (const report of reportsData) {
    // Basic pagination logic
    if (y < 140) {
      drawFooter(page);
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      createHeaderAndPatientInfo(page);
      drawTableHeader(page);
    }

    const rowHeight = 36; // Increased slightly for breathing room
    
    // Zebra striping background
    page.drawRectangle({
      x: marginX,
      y: y - rowHeight,
      width: usableWidth,
      height: rowHeight,
      color: isEven ? veryLightGray : white,
    });

    const isAbnormal = report.isAbnormal;
    const textY = y - 22;

    drawText(page, report.test?.testName || 'N/A', colX[0], textY, 10, font, darkGray);
    
    // Result text (bold if abnormal)
    const resultFont = isAbnormal ? boldFont : font;
    drawText(page, String(report.resultValue || 'N/A'), colX[1], textY, 10, resultFont, darkGray);
    
    drawText(page, report.test?.unit || '-', colX[2], textY, 10, font, darkGray);
    drawText(page, report.test?.normalRange || '-', colX[3], textY, 10, font, darkGray);

    // 8. Status Badge/Pill - Increased font size and padding
    const statusTextStr = isAbnormal ? 'ABNORMAL' : 'NORMAL';
    const badgeBg = isAbnormal ? abnormalBg : normalBg;
    const badgeText = isAbnormal ? abnormalText : normalText;
    
    const statusTextWidth = boldFont.widthOfTextAtSize(statusTextStr, 10);
    page.drawRectangle({
      x: colX[4],
      y: y - 28,
      width: statusTextWidth + 18,
      height: 20, // Taller badge for more padding
      color: badgeBg,
    });
    // Centered text inside the taller badge
    drawText(page, statusTextStr, colX[4] + 9, y - 22, 10, boldFont, badgeText);

    // Subtle horizontal separator line
    page.drawLine({ start: { x: marginX, y: y - rowHeight }, end: { x: pageWidth - marginX, y: y - rowHeight }, thickness: 0.5, color: dividerGray });

    y -= rowHeight;
    isEven = !isEven;
  }
  
  // 6. Legend/Key for Abnormal values
  y -= 25;
  drawText(page, '* Values outside the normal range are marked as ABNORMAL', marginX, y, 9, italicFont, darkGray);

  drawFooter(page);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

export const generateInvoicePDF = async (bookingData) => {
  const pdfDoc = await PDFDocument.create();
  
  let microscopeImage = null;
  try {
    const imgPath = path.join(process.cwd(), 'assets', 'microscope.jpg');
    if (fs.existsSync(imgPath)) {
      const imgBytes = fs.readFileSync(imgPath);
      microscopeImage = await pdfDoc.embedJpg(imgBytes);
    }
  } catch (err) {
    console.error("Could not load microscope watermark:", err);
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const primaryTeal = rgb(0.05, 0.35, 0.38);
  const goldAccent = rgb(0.83, 0.68, 0.21);
  const lightTealBg = rgb(0.95, 0.97, 0.97);
  const white = rgb(1, 1, 1);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const veryLightGray = rgb(0.97, 0.97, 0.97);
  const dividerGray = rgb(0.85, 0.85, 0.85);

  const marginX = 45;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const usableWidth = pageWidth - marginX * 2;

  const p = bookingData.patient || {};
  const dateStr = new Date(bookingData.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const bookingIdStr = bookingData.bookingId || '-';
  const invoiceNo = `INV-${bookingIdStr}`;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  const drawText = (currentPage, text, x, posY, size, fontType, color = darkGray) => {
    currentPage.drawText(text, { x, y: posY, size, font: fontType, color });
  };

  const drawPageDecorations = (currentPage) => {
    currentPage.drawRectangle({
      x: 15, y: 15,
      width: pageWidth - 30, height: pageHeight - 30,
      borderColor: primaryTeal, borderWidth: 1.5,
    });
    
    if (microscopeImage) {
      const targetWidth = 300;
      const scale = targetWidth / microscopeImage.width;
      const imgWidth = microscopeImage.width * scale;
      const imgHeight = microscopeImage.height * scale;
      
      const centerX = (pageWidth - imgWidth) / 2;
      const centerY = (pageHeight - imgHeight) / 2; 

      currentPage.drawImage(microscopeImage, {
        x: centerX,
        y: centerY,
        width: imgWidth,
        height: imgHeight,
        opacity: 0.05,
      });
    }
  };

  const createHeaderAndPatientInfo = (currentPage) => {
    y = pageHeight;
    drawPageDecorations(currentPage);
    
    const headerHeight = 95;
    currentPage.drawRectangle({
      x: 15,
      y: y - headerHeight - 15,
      width: pageWidth - 30,
      height: headerHeight,
      color: primaryTeal,
    });
    
    currentPage.drawRectangle({
      x: 15,
      y: y - headerHeight - 18,
      width: pageWidth - 30,
      height: 3,
      color: goldAccent,
    });
    
    y -= 55;
    drawText(currentPage, 'Al-Hayat Diagnostic Lab', marginX, y, 26, boldFont, white);
    drawText(currentPage, `Invoice No: ${invoiceNo}`, pageWidth - marginX - 160, y, 11, boldFont, goldAccent);
    
    y -= 25;
    drawText(currentPage, '123 Health Avenue, Medical District, City - 10001 | Contact: +1-800-ALHAYAT', marginX, y, 10, font, rgb(0.9, 0.9, 0.9));
    
    y -= 50; 

    drawText(currentPage, 'TAX INVOICE', pageWidth / 2 - 60, y, 18, boldFont, primaryTeal);

    const boxHeight = 85;
    y -= (boxHeight + 10);
    currentPage.drawRectangle({
      x: marginX,
      y: y,
      width: usableWidth,
      height: boxHeight,
      color: lightTealBg,
    });

    const infoYStart = y + boxHeight - 20;
    
    drawText(currentPage, 'Patient Name:', marginX + 15, infoYStart, 10, font, darkGray);
    drawText(currentPage, p.name || '-', marginX + 90, infoYStart, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Patient ID:', marginX + 15, infoYStart - 22, 10, font, darkGray);
    drawText(currentPage, p.patientId || '-', marginX + 90, infoYStart - 22, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Phone:', marginX + 15, infoYStart - 44, 10, font, darkGray);
    drawText(currentPage, p.phone || '-', marginX + 90, infoYStart - 44, 11, boldFont, darkGray);
    
    const rightColX = marginX + 270;
    
    drawText(currentPage, 'Booking ID:', rightColX, infoYStart, 10, font, darkGray);
    drawText(currentPage, bookingIdStr, rightColX + 90, infoYStart, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Invoice Date:', rightColX, infoYStart - 22, 10, font, darkGray);
    drawText(currentPage, dateStr, rightColX + 90, infoYStart - 22, 11, boldFont, darkGray);
    
    drawText(currentPage, 'Referred By:', rightColX, infoYStart - 44, 10, font, darkGray);
    drawText(currentPage, bookingData.referredBy || 'Self', rightColX + 90, infoYStart - 44, 11, boldFont, darkGray);

    y -= 25;
    currentPage.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 1.5, color: primaryTeal });
    y -= 25;
  };

  const drawFooter = (currentPage) => {
    const footerY = 50;
    currentPage.drawLine({ start: { x: marginX, y: footerY + 50 }, end: { x: pageWidth - marginX, y: footerY + 50 }, thickness: 1.5, color: primaryTeal });
    
    const footerText = 'This is a computer generated invoice and does not require a physical signature.';
    currentPage.drawText(footerText, { 
      x: marginX, y: footerY + 20, size: 9, font: italicFont, color: rgb(0.5, 0.5, 0.5) 
    });
    
    const sigX = pageWidth - marginX - 130;
    currentPage.drawLine({ start: { x: sigX, y: footerY + 35 }, end: { x: sigX + 130, y: footerY + 35 }, thickness: 1, color: darkGray });
    currentPage.drawText('Authorized Signatory', { x: sigX + 12, y: footerY + 15, size: 10, font: boldFont, color: darkGray });
  };

  createHeaderAndPatientInfo(page);

  const tableHeaderHeight = 25;
  const drawTableHeader = (currentPage) => {
    currentPage.drawRectangle({
      x: marginX,
      y: y - tableHeaderHeight,
      width: usableWidth,
      height: tableHeaderHeight,
      color: primaryTeal,
    });

    const colX = [marginX + 10, marginX + 50, marginX + 300, marginX + 370, marginX + 440];
    
    const headerY = y - 17;
    drawText(currentPage, 'S.No', colX[0], headerY, 10, boldFont, white);
    drawText(currentPage, 'Test/Service', colX[1], headerY, 10, boldFont, white);
    drawText(currentPage, 'Qty', colX[2], headerY, 10, boldFont, white);
    drawText(currentPage, 'Rate', colX[3], headerY, 10, boldFont, white);
    drawText(currentPage, 'Amount', colX[4], headerY, 10, boldFont, white);
    
    y -= tableHeaderHeight;
  };

  drawTableHeader(page);

  let isEven = false;
  const colX = [marginX + 10, marginX + 50, marginX + 300, marginX + 370, marginX + 440];
  
  let totalAmount = 0;
  let index = 1;

  for (const test of (bookingData.tests || [])) {
    if (y < 140) {
      drawFooter(page);
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      createHeaderAndPatientInfo(page);
      drawTableHeader(page);
    }

    const rowHeight = 30;
    
    page.drawRectangle({
      x: marginX,
      y: y - rowHeight,
      width: usableWidth,
      height: rowHeight,
      color: isEven ? veryLightGray : white,
    });

    const textY = y - 19;
    const price = test.price || 0;
    totalAmount += price;

    drawText(page, String(index), colX[0], textY, 10, font, darkGray);
    drawText(page, test.testName || 'N/A', colX[1], textY, 10, font, darkGray);
    drawText(page, '1', colX[2], textY, 10, font, darkGray);
    drawText(page, `Rs ${price}`, colX[3], textY, 10, font, darkGray);
    drawText(page, `Rs ${price}`, colX[4], textY, 10, font, darkGray);

    page.drawLine({ start: { x: marginX, y: y - rowHeight }, end: { x: pageWidth - marginX, y: y - rowHeight }, thickness: 0.5, color: dividerGray });

    y -= rowHeight;
    isEven = !isEven;
    index++;
  }
  
  // Summary Section
  y -= 10;
  
  // Payment Status Badge
  const pStatus = bookingData.paymentStatus || 'unpaid';
  let badgeBg = rgb(1, 0.9, 0.9);
  let badgeText = rgb(0.7, 0.1, 0.1);
  let statusStr = 'UNPAID';
  
  if (pStatus === 'paid') {
    badgeBg = rgb(0.86, 0.98, 0.86);
    badgeText = rgb(0.1, 0.5, 0.2);
    statusStr = 'PAID';
  } else if (pStatus === 'partial') {
    badgeBg = rgb(1, 0.95, 0.85);
    badgeText = rgb(0.8, 0.4, 0);
    statusStr = 'PARTIAL';
  }

  const badgeWidth = boldFont.widthOfTextAtSize(statusStr, 11) + 20;
  page.drawRectangle({
    x: marginX,
    y: y - 22,
    width: badgeWidth,
    height: 22,
    color: badgeBg,
  });
  drawText(page, statusStr, marginX + 10, y - 16, 11, boldFont, badgeText);

  // Totals
  const rightAlign = marginX + 350;
  drawText(page, 'Subtotal:', rightAlign, y - 15, 10, font, darkGray);
  drawText(page, `Rs ${totalAmount}`, rightAlign + 70, y - 15, 10, font, darkGray);
  
  y -= 35;
  
  // Total Highlight Box
  page.drawRectangle({
    x: rightAlign - 10,
    y: y - 25,
    width: 165,
    height: 35,
    color: lightTealBg,
  });
  drawText(page, 'Total Amount:', rightAlign, y - 13, 12, boldFont, primaryTeal);
  drawText(page, `Rs ${totalAmount}`, rightAlign + 75, y - 13, 12, boldFont, primaryTeal);

  // Note
  y -= 45;
  drawText(page, 'Payment Terms: Payment due upon receipt of services.', marginX, y, 9, italicFont, rgb(0.4, 0.4, 0.4));
  drawText(page, 'Thank you for choosing Al-Hayat Diagnostic Lab.', marginX, y - 15, 9, italicFont, rgb(0.4, 0.4, 0.4));

  drawFooter(page);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

