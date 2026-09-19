# Comprehensive Manual QA & UAT Testing Suite
## Pathology Lab Management System

This document provides exhaustive, enterprise-grade manual testing scenarios formatted as tables for easy tracking during Quality Assurance (QA) and User Acceptance Testing (UAT).

---

## 1. Authentication & Security (AUTH)

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Auth | Valid Admin Login | A user with role `admin` exists in the database. | `email`: admin@lab.com<br>`password`: admin123 | 1. Navigate to `/login`.<br>2. Enter credentials.<br>3. Click "Sign In". | • System verifies credentials via `bcryptjs`.<br>• JWT is generated and stored in `localStorage`.<br>• Redirects to `/dashboard`.<br>• **Sidebar Check:** "Settings" and "Users" menus MUST be visible. | [ ] |
| **AUTH-02** | Auth | Invalid Credentials Lockout & Toast | None | `email`: wrong@lab.com<br>`password`: invalidPass | 1. Navigate to `/login`.<br>2. Enter invalid credentials.<br>3. Click "Sign In". | • HTTP 401 Unauthorized from backend.<br>• User remains on `/login`.<br>• Red error toast appears: "Invalid email or password". | [ ] |
| **AUTH-03** | Auth | Route Protection & JWT Expiry | None | None | 1. Clear `localStorage` in dev tools.<br>2. Manually navigate to `/dashboard/patients`. | • `ProtectedRoute.js` intercepts the request.<br>• Automatically redirects browser to `/login`. | [ ] |
| **AUTH-04** | Auth | Change Password Form UI & Toggle | Logged in as any user. | None | 1. Click Profile icon -> Change Password.<br>2. Check presence of 3 fields.<br>3. Click Eye icon on all fields. | • Modal opens centered.<br>• Fields: Current Password, New Password, Confirm New Password.<br>• Eye icon toggles password visibility. | [ ] |
| **AUTH-05** | Auth | Change Password Functionality | Logged in as any user. | `current`: oldpass<br>`new`: newpass<br>`confirm`: newpass | 1. Open Change Password modal.<br>2. Enter correct current password.<br>3. Enter matching new passwords.<br>4. Submit. | • HTTP 200 OK.<br>• Success toast appears.<br>• Modal closes. Next login requires `newpass`. | [ ] |
| **AUTH-06** | Users | Edit User Details | Logged in as Admin. User to edit exists. | `name`: Updated Name<br>`phone`: 9999999999 | 1. Navigate to Staff/Users.<br>2. Click Edit on a user.<br>3. Change name and phone.<br>4. Save. | • Details updated successfully.<br>• Role and status remain unchanged.<br>• UI reflects new details immediately. | [ ] |

---

## 2. Patient Management (PAT)

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-01** | Patient | Register Patient - Field Validations | None | Blank "Name", filled "Age" & "Phone" | 1. Login as Receptionist.<br>2. Navigate to "Patients" -> "New Patient".<br>3. Leave "Name" blank.<br>4. Click Submit. | • HTML5 / Frontend validation blocks submission.<br>• Backend returns HTTP 400 if bypassed. | [ ] |
| **PAT-02** | Patient | Auto-generation of Patient ID | Database has 9 existing patients. | Valid Patient Details | 1. Fill all required fields for a New Patient.<br>2. Submit form. | • Success toast appears.<br>• Patient appears at top of table.<br>• `patientId` is exactly `PAT-0010`. | [ ] |
| **PAT-03** | Patient | Global Regex Search | Patient named "Johnathan Doe" exists. | Search query: `john` | 1. Type "john" in patient search bar. | • Table instantly filters to show "Johnathan Doe" (case insensitive). | [ ] |

---

## 3. Test Catalog Management (TST)

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TST-01** | Catalog | Create Test with Normal Range | Logged in as Admin. | `Name`: Hemoglobin<br>`Price`: 500<br>`Range`: 13.5-17.5 | 1. Navigate to "Tests" -> "Add New Test".<br>2. Input Test Data.<br>3. Click Save. | • Test is saved.<br>• DB stores `normalRange` exactly as string `"13.5-17.5"`. | [ ] |
| **TST-02** | Catalog | Toggle Test Active Status | "Hemoglobin" test exists. | Status: `Inactive` | 1. Edit "Hemoglobin" test.<br>2. Uncheck "Active" and Save.<br>3. Go to "New Booking" -> Select "Tests". | • "Hemoglobin" does NOT appear in New Booking dropdown.<br>• Past bookings remain unaffected. | [ ] |

---

## 4. Booking Lifecycle & Logic (BKG)

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BKG-01** | Booking | Dynamic Total Amount Calculation | Tests A ($100) and B ($250) exist. | Test A, Test B | 1. Open "New Booking".<br>2. Select Patient.<br>3. Select Test A and Test B. | • UI updates "Total Amount" to `$350`.<br>• Backend recalculates and verifies `$350` upon submission. | [ ] |
| **BKG-02** | Booking | Cascading Deletion | Booking (BK-100) has 2 saved Reports. | `bookingId`: BK-100 | 1. Click "Delete" on booking BK-100.<br>2. Confirm in dialog. | • Booking removed from UI.<br>• **DB Check:** Querying `reports` for `BK-100` returns 0 docs. | [ ] |

---

## 5. Result Entry & Abnormality Parser (RPT)

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RPT-01** | Reports | Normal Result Entry | Booking contains Test with range `10-20`. | Value: `15` | 1. Click "Enter Results".<br>2. Input `15`.<br>3. Submit. | • Backend regex parses min: 10, max: 20.<br>• 15 is within range. `isAbnormal` saved as `false`. | [ ] |
| **RPT-02** | Reports | Abnormal Result Entry | Booking contains Test with range `10-20`. | Value: `25` | 1. Click "Enter Results".<br>2. Input `25`.<br>3. Submit. | • 25 > 20. `isAbnormal` saved as `true`. | [ ] |
| **RPT-03** | Reports | Report Readiness Guardrail (400) | Booking has 3 tests. Only 2 have results. | N/A | 1. Click "Mark Report Ready". | • HTTP 400 Bad Request.<br>• UI Toast: "All test results must be entered."<br>• Backend responds with missing test names. | [ ] |

---

## 6. PDF Engine (Puppeteer) (PDF)

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PDF-01** | Engine | Dynamic Abnormality Styling | Booking is `report_ready` with 1 abnormal result. | N/A | 1. Click "Download Report".<br>2. Open downloaded PDF. | • Abnormal value styled in **Bold** and **Red**.<br>• Normal results in standard black text. | [ ] |
| **PDF-02** | Engine | Post-Download Lifecycle Update | Booking is `report_ready`. | N/A | 1. Click "Download Report".<br>2. Refresh Bookings table. | • Booking status automatically updates to `delivered`. | [ ] |

---

## 7. Progressive Web App (PWA) Aggression

| Test ID | Module | Scenario / Description | Pre-conditions | Test Data | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PWA-01** | PWA | Event Interception | None | N/A | 1. Open web app on Chrome (Android/Desktop). | • Default browser infobar is suppressed.<br>• Custom Tailwind Modal triggers. | [ ] |
| **PWA-02** | PWA | Aggressive Fallback Loop | None | N/A | 1. Click "Not Now" on custom prompt.<br>2. Hard refresh page (F5). | • Prompt aggressively reappears (state is not persisted in `localStorage`). | [ ] |
