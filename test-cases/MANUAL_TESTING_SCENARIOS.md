# Pathology Lab Management System - Comprehensive Test Cases

This document outlines detailed manual testing scenarios for Quality Assurance (QA) and User Acceptance Testing (UAT). It is designed to ensure all core modules, workflows, and edge cases function as intended before any production deployment.

---

## 1. Authentication & Role-Based Access Control (RBAC)

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| AUTH-01 | Auth | Login with valid Admin credentials. | Redirects to Admin Dashboard; full sidebar menu visible. | [ ] |
| AUTH-02 | Auth | Login with valid Technician credentials. | Redirects to Dashboard; "Settings" and "Users" menus are hidden. | [ ] |
| AUTH-03 | Auth | Login with invalid email or password. | Displays red error toast: "Invalid email or password". Does not redirect. | [ ] |
| AUTH-04 | Auth | Access protected route (e.g., `/dashboard`) without logging in. | Automatically redirects to `/login`. | [ ] |
| AUTH-05 | Auth | Click "Logout" from the sidebar. | JWT is cleared from `localStorage`. User is redirected to `/login`. | [ ] |

---

## 2. Patient Management

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| PAT-01  | Patient| Navigate to Patients -> Click "New Patient" -> Submit empty form. | Form validation kicks in; requires Name, Age, Phone. | [ ] |
| PAT-02  | Patient| Fill all fields -> Submit. | Success toast appears. Patient appears in the table with an auto-generated ID (e.g., `PAT-0042`). | [ ] |
| PAT-03  | Patient| Search for patient by Name in the global search bar. | Table filters to show only matching patients. | [ ] |
| PAT-04  | Patient| Click "View" on a patient row. | Navigates to `[id]` dynamic route. Shows patient demographics and booking history. | [ ] |

---

## 3. Test Catalog Management

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| TST-01  | Catalog| Navigate to Tests -> Click "Add New Test". | Modal opens. Requires Test Name, Price, Category. | [ ] |
| TST-02  | Catalog| Add a test with `normalRange` format `4.0 - 10.0`. | Test saves successfully. Displayed in table. | [ ] |
| TST-03  | Catalog| Click "Edit" -> Toggle active status to inactive -> Save. | Test shows as inactive. It should no longer appear in the "New Booking" dropdown. | [ ] |

---

## 4. Booking & Lifecycle Management

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| BKG-01  | Booking| Navigate to Bookings -> New Booking -> Select Patient -> Select 2 Tests. | Total Amount auto-calculates correctly by summing both test prices. | [ ] |
| BKG-02  | Booking| Submit Booking. | Booking created with status `pending` and payment `unpaid`. | [ ] |
| BKG-03  | Booking| Global Search: Type exact `bookingId` (e.g., BK-0015). | Returns exactly the matched booking. | [ ] |
| BKG-04  | Booking| Global Search: Type Patient Name in Bookings view. | Returns all bookings associated with that patient (tests backend `$in` regex logic). | [ ] |
| BKG-05  | Booking| Update status from `pending` to `sample_collected`. | Status updates. Backend stamps `sampleCollectedAt` timestamp. | [ ] |
| BKG-06  | Booking| Delete Booking via confirm dialog. | Booking is removed. Verify in DB that associated `Report` documents are also deleted (Cascading delete). | [ ] |

---

## 5. Result Entry & Abnormality Detection

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| RPT-01  | Reports| Open a Booking in `sample_collected` state -> Click "Enter Results". | Form dynamically loads fields for the specific tests booked. | [ ] |
| RPT-02  | Reports| Enter value **within** `normalRange` (e.g., 5.0 for range 4.0-10.0). | Submits successfully. Backend flags `isAbnormal = false`. | [ ] |
| RPT-03  | Reports| Enter value **outside** `normalRange` (e.g., 12.5 for range 4.0-10.0). | Submits successfully. Backend flags `isAbnormal = true` (via Regex parser). | [ ] |
| RPT-04  | Reports| Attempt to mark "Report Ready" while leaving 1 test result blank. | Fails with 400 Bad Request. Toast displays: "All test results must be entered". | [ ] |
| RPT-05  | Reports| Enter all results -> Mark "Report Ready". | Booking status changes to `report_ready`. "Download PDF" button becomes active. | [ ] |

---

## 6. PDF Generation (Puppeteer)

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| PDF-01  | Engine | Click "Download Report" on a `report_ready` booking. | Browser triggers file download: `report-BK-XXXX.pdf`. | [ ] |
| PDF-02  | Engine | Verify PDF Header/Footer. | Lab Name, Logo, and Address (from `LabSettings`) appear correctly on the PDF. | [ ] |
| PDF-03  | Engine | Verify Abnormality Rendering. | Any result flagged `isAbnormal = true` renders in bold red text to alert the doctor. | [ ] |
| PDF-04  | Engine | Lifecycle verification post-download. | Booking status automatically updates from `report_ready` to `delivered`. | [ ] |

---

## 7. PWA Installation Mechanics

| Test ID | Module | Scenario / Steps | Expected Result | Status |
|---------|--------|------------------|-----------------|--------|
| PWA-01  | Intercept| Open app in Chrome on Android / Desktop for the first time. | Custom Tailwind "Install App" modal appears overriding default infobar. | [ ] |
| PWA-02  | Reject | Click "Not Now" on the custom prompt. | Modal closes. | [ ] |
| PWA-03  | Aggress| Refresh the page after clicking "Not Now". | Custom prompt reappears (aggressive interception verified). | [ ] |
| PWA-04  | Install| Click "Install Now". | Browser's native install prompt triggers. Upon acceptance, app adds to home screen. | [ ] |
| PWA-05  | Offline| Turn off Wi-Fi -> Open installed PWA. | Shell loads successfully from Service Worker cache without showing the Chrome offline dinosaur. | [ ] |

---

*This document should be executed sequentially prior to any major release. Check off the [ ] boxes upon successful validation.*
