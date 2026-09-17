# Comprehensive Manual QA & UAT Testing Suite
## Pathology Lab Management System

This document provides exhaustive, enterprise-grade manual testing scenarios. It includes pre-conditions, required test data, execution steps, expected outcomes, and edge-case validations for Quality Assurance (QA) engineers.

---

## 1. Authentication & Security (AUTH)

### Test Case: AUTH-01 | Valid Admin Login
- **Description:** Verify that an Admin user can log in and access all administrative features.
- **Pre-conditions:** A user with role `admin` exists in the database.
- **Test Data:** `email: admin@lab.com`, `password: admin123`
- **Execution Steps:**
  1. Navigate to `/login`.
  2. Enter valid Admin email and password.
  3. Click "Sign In".
- **Expected Result:**
  - System verifies credentials via `bcryptjs`.
  - JWT is generated and stored in `localStorage`.
  - User is redirected to `/dashboard`.
  - **Sidebar Check:** The "Settings" and "Users" menus MUST be visible.
- **Status:** [ ]

### Test Case: AUTH-02 | Invalid Credentials Lockout & Toast
- **Description:** Verify the system's response to incorrect passwords or non-existent emails.
- **Pre-conditions:** None.
- **Test Data:** `email: wrong@lab.com`, `password: invalidPass`
- **Execution Steps:**
  1. Navigate to `/login`.
  2. Enter invalid credentials.
  3. Click "Sign In".
- **Expected Result:**
  - HTTP 401 Unauthorized response from backend.
  - User remains on `/login`.
  - A red error toast appears at the top right: "Invalid email or password".
- **Status:** [ ]

### Test Case: AUTH-03 | Route Protection & JWT Expiry
- **Description:** Ensure unauthenticated users cannot bypass the login screen by typing URLs.
- **Execution Steps:**
  1. Clear `localStorage` in browser dev tools.
  2. Attempt to manually navigate to `/dashboard/patients`.
- **Expected Result:**
  - The `ProtectedRoute.js` wrapper intercepts the request.
  - Automatically redirects the browser back to `/login`.
- **Status:** [ ]

---

## 2. Patient Management (PAT)

### Test Case: PAT-01 | Register Patient - Field Validations
- **Description:** Verify form validation rules prevent incomplete records.
- **Execution Steps:**
  1. Login as Receptionist.
  2. Navigate to "Patients" -> Click "New Patient".
  3. Leave "Name" blank but fill "Age" and "Phone".
  4. Click Submit.
- **Expected Result:**
  - HTML5 / Frontend validation blocks submission.
  - If bypassed via Postman, backend returns HTTP 400 with a strict validation error.
- **Status:** [ ]

### Test Case: PAT-02 | Auto-generation of Patient ID
- **Description:** Verify that the backend accurately generates sequential IDs (e.g., PAT-0010).
- **Pre-conditions:** Database has 9 existing patients.
- **Execution Steps:**
  1. Fill all required fields for a New Patient.
  2. Submit the form.
- **Expected Result:**
  - Success toast appears.
  - The new patient appears at the top of the table.
  - The `patientId` field is exactly `PAT-0010` (no duplicates).
- **Status:** [ ]

### Test Case: PAT-03 | Global Regex Search
- **Description:** Verify search handles partial matches and case insensitivity.
- **Test Data:** Patient name is "Johnathan Doe".
- **Execution Steps:**
  1. Type "john" in the patient search bar.
- **Expected Result:**
  - Table instantly filters to show "Johnathan Doe".
- **Status:** [ ]

---

## 3. Test Catalog Management (TST)

### Test Case: TST-01 | Create Test with Normal Range
- **Description:** Add a new diagnostic test and verify the range format.
- **Pre-conditions:** Logged in as Admin.
- **Test Data:** Name: `Hemoglobin`, Category: `Hematology`, Price: `500`, Range: `13.5-17.5`, Unit: `g/dL`.
- **Execution Steps:**
  1. Navigate to "Tests" -> "Add New Test".
  2. Input Test Data.
  3. Click Save.
- **Expected Result:**
  - Test is saved.
  - Verifiable in DB that `normalRange` is stored exactly as string `"13.5-17.5"`.
- **Status:** [ ]

### Test Case: TST-02 | Toggle Test Active Status
- **Description:** Verify that deactivating a test hides it from future bookings without deleting historical data.
- **Execution Steps:**
  1. Edit "Hemoglobin" test.
  2. Uncheck "Active" and Save.
  3. Navigate to "New Booking" -> Select "Tests" dropdown.
- **Expected Result:**
  - "Hemoglobin" does NOT appear in the New Booking dropdown.
  - Existing past bookings containing "Hemoglobin" remain unaffected.
- **Status:** [ ]

---

## 4. Booking Lifecycle & Logic (BKG)

### Test Case: BKG-01 | Dynamic Total Amount Calculation
- **Description:** Verify that the frontend correctly sums the price of selected tests.
- **Test Data:** Test A ($100), Test B ($250).
- **Execution Steps:**
  1. Open "New Booking" modal.
  2. Select Patient.
  3. Select Test A and Test B.
- **Expected Result:**
  - The UI dynamically updates "Total Amount" to `$350`.
  - Upon submission, the backend also recalculates and verifies the `$350` to prevent frontend tampering.
- **Status:** [ ]

### Test Case: BKG-02 | Cascading Deletion
- **Description:** Ensure deleting a booking deletes associated reports to prevent database bloating.
- **Pre-conditions:** A booking (BK-100) exists with 2 saved Report documents.
- **Execution Steps:**
  1. Click "Delete" on booking BK-100.
  2. Confirm in dialog.
- **Expected Result:**
  - Booking is removed from UI.
  - **Database Check:** Querying `reports` collection for `bookingId == BK-100` returns 0 documents.
- **Status:** [ ]

---

## 5. Result Entry & Abnormality Parser (RPT)

### Test Case: RPT-01 | Normal Result Entry
- **Description:** Verify the backend correctly parses a normal result.
- **Pre-conditions:** Booking contains Test with range `10-20`.
- **Execution Steps:**
  1. Click "Enter Results".
  2. Input value `15`.
  3. Submit.
- **Expected Result:**
  - Backend regex `/^([\d.]+)\s*-\s*([\d.]+)$/` parses min: 10, max: 20.
  - 15 is within range. `isAbnormal` is saved as `false`.
- **Status:** [ ]

### Test Case: RPT-02 | Abnormal Result Entry
- **Description:** Verify the backend correctly parses an abnormal result.
- **Execution Steps:**
  1. Click "Enter Results".
  2. Input value `25`.
  3. Submit.
- **Expected Result:**
  - 25 > 20. `isAbnormal` is saved as `true`.
- **Status:** [ ]

### Test Case: RPT-03 | Report Readiness Guardrail (400 Bad Request)
- **Description:** Prevent marking a report as ready if tests are missing.
- **Pre-conditions:** Booking has 3 tests. Only 2 have results entered.
- **Execution Steps:**
  1. Click "Mark Report Ready".
- **Expected Result:**
  - HTTP 400 Bad Request.
  - UI Toast: "All test results must be entered."
  - Backend response contains the array of missing test names.
- **Status:** [ ]

---

## 6. PDF Engine (Puppeteer) (PDF)

### Test Case: PDF-01 | Dynamic Abnormality Styling
- **Description:** Verify Puppeteer renders the `isAbnormal` flag correctly in HTML/CSS.
- **Pre-conditions:** A booking is `report_ready` and contains at least 1 abnormal result.
- **Execution Steps:**
  1. Click "Download Report".
  2. Open the downloaded PDF.
- **Expected Result:**
  - The abnormal result value is styled explicitly in **Bold** and **Red Color** to immediately alert the physician.
  - Normal results are styled in standard black text.
- **Status:** [ ]

### Test Case: PDF-02 | Post-Download Lifecycle Update
- **Description:** Verify that generating a PDF transitions the booking state.
- **Execution Steps:**
  1. Booking is currently `report_ready`.
  2. Click "Download Report".
  3. Refresh the Bookings table.
- **Expected Result:**
  - The booking status is now automatically updated to `delivered`.
- **Status:** [ ]

---

## 7. Progressive Web App (PWA) Aggression

### Test Case: PWA-01 | Event Interception
- **Description:** Verify the native browser prompt is suppressed.
- **Execution Steps:**
  1. Open the web app on Chrome (Android or Desktop).
- **Expected Result:**
  - The default browser "Mini-infobar" does NOT appear.
  - Instead, the custom Tailwind styled Modal (`InstallPrompt.js`) triggers with "Install Now" and "Not Now" buttons.
- **Status:** [ ]

### Test Case: PWA-02 | Aggressive Fallback Loop
- **Description:** Ensure the prompt aggressively returns if dismissed, prioritizing app installation.
- **Execution Steps:**
  1. Click "Not Now" on the custom prompt.
  2. Hard refresh the page (`F5` or pull-to-refresh).
- **Expected Result:**
  - Because state is intentionally NOT persisted in `localStorage`, the prompt aggressively reappears to encourage installation.
- **Status:** [ ]
