# Comprehensive Technical Documentation
## Pathology Lab Management System

This document serves as the complete, in-depth technical reference for the Pathology Lab Management System. It expands upon the README to provide detailed insights into the architecture, database schema, API contracts, and frontend component structure for developers and maintainers.

---

## 1. System Architecture Details

The system follows a strict Client-Server decoupled architecture.

### 1.1 Frontend (Next.js 14 App Router)
- **Framework:** Next.js (React 18)
- **Routing:** App Router (`src/app`). Pages are server-rendered by default unless marked with `"use client"`.
- **State Management:** 
  - Global state (Auth, UI Toasts) is managed via React Context (`src/context/AuthContext.js`).
  - Local state is managed using `useState` and `useReducer`.
- **Styling:** Tailwind CSS. Global styles are defined in `src/app/globals.css`.
- **PWA Integration:** 
  - Uses `@ducanh2912/next-pwa`. 
  - Manifest is located at `public/manifest.json`.
  - Service worker caches static assets for offline capability and fast loading.
  - A custom aggressive prompt (`InstallPrompt.js`) overrides default browser installation behavior.

### 1.2 Backend (Node.js & Express)
- **Framework:** Express.js
- **Pattern:** MVC (Model-View-Controller) adapted for APIs (Routes-Controllers-Models).
- **Authentication:** Stateless JWT. Tokens are generated upon login and verified via `protect` middleware.
- **PDF Generation Engine:** 
  - Puppeteer is used to launch a headless Chromium browser.
  - HTML templates are injected with dynamic data and printed to PDF buffers.
  - Sent back to the client as a stream (`application/pdf`).

---

## 2. Database Schema (Mongoose)

### 2.1 User (`User.js`)
Handles staff authentication and Role-Based Access Control.
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, enum: `['admin', 'receptionist', 'technician']`)
- `isActive` (Boolean, default: true)

### 2.2 Patient (`Patient.js`)
Stores patient demographics.
- `patientId` (String, unique, auto-generated e.g., PAT-0001)
- `name` (String, required)
- `age` (Number, required)
- `gender` (String, enum: `['Male', 'Female', 'Other']`)
- `phone` (String, required)
- `email` (String)
- `address` (String)

### 2.3 Test (`Test.js`)
The catalog of diagnostic tests.
- `testCode` (String, unique)
- `name` (String, required)
- `category` (String, required e.g., Hematology, Biochemistry)
- `price` (Number, required)
- `normalRange` (String)
- `unit` (String e.g., mg/dL)
- `isActive` (Boolean, default: true)

### 2.4 Booking (`Booking.js`)
Transactional record mapping patients to tests.
- `bookingId` (String, unique, auto-generated e.g., BK-0001)
- `patient` (ObjectId, ref: 'Patient')
- `tests` (Array of ObjectId, ref: 'Test')
- `totalAmount` (Number)
- `paymentStatus` (String, enum: `['paid', 'unpaid', 'partial']`)
- `status` (String, enum: `['pending', 'sample_collected', 'testing', 'completed']`)
- `createdBy` (ObjectId, ref: 'User')

### 2.5 Report (`Report.js`)
Stores the actual entered results.
- `booking` (ObjectId, ref: 'Booking')
- `patient` (ObjectId, ref: 'Patient')
- `results` (Array of Objects):
  - `test` (ObjectId, ref: 'Test')
  - `value` (String)
  - `isAbnormal` (Boolean)
- `remarks` (String)
- `enteredBy` (ObjectId, ref: 'User')

---

## 3. Comprehensive API Reference

All requests must include the header `Authorization: Bearer <token>` unless stated otherwise.

### 3.1 Auth API (`/api/auth`)
- **`POST /login`**: Accepts `{ email, password }`. Returns `{ token, user }`. (Public)
- **`GET /me`**: Returns the profile of the current authenticated user.

### 3.2 Patient API (`/api/patients`)
- **`GET /`**: Returns an array of patient documents. Supports pagination & search queries.
- **`POST /`**: Registers a new patient. Auto-generates `patientId`.
- **`GET /:id`**: Fetches a single patient's details and booking history.
- **`PUT /:id`**: Updates patient demographics.

### 3.3 Test API (`/api/tests`)
- **`GET /`**: Returns the test catalog.
- **`POST /`**: Creates a new test. Requires `admin` role.
- **`PUT /:id`**: Updates test parameters (price, range, status). Requires `admin` role.

### 3.4 Booking API (`/api/bookings`)
- **`GET /`**: Retrieves bookings. Can filter by status (e.g., `?status=pending`).
- **`POST /`**: Creates a new booking, computes `totalAmount`, sets status to `pending`.
- **`PUT /:id/status`**: Updates the lifecycle status of the booking.
- **`PUT /:id/payment`**: Updates payment status (e.g., changing `unpaid` to `paid`).

### 3.5 Report API (`/api/reports`)
- **`POST /`**: Submits test results. Payload: `{ bookingId, results: [...] }`. Changes booking status to `completed`.
- **`GET /download/:bookingId`**: Triggers the Puppeteer PDF generator. Responds with raw PDF binary.

---

## 4. Frontend Component Breakdown

The frontend is highly modularized under `src/components/`.

### 4.1 Modals
Modals are used to prevent context-switching and keep the user on the dashboard.
- **`NewBookingModal.js`**: Handles multi-step booking logic (Select Patient -> Select Tests -> Payment).
- **`TestFormModal.js`**: Admin interface for creating/editing tests.
- **`ConfirmDialog.js`**: Reusable generic modal for destructive actions (e.g., Deleting a record).

### 4.2 Navigation
- **`Sidebar.js`**: Desktop navigation. Renders role-specific links.
- **`BottomNav.js`**: Mobile navigation wrapper. Sticks to the bottom of the screen on small devices for app-like feel.

### 4.3 PWA Enhancements
- **`InstallPrompt.js`**: A custom component that intercepts the `beforeinstallprompt` event. It aggressively displays a tailored UI to encourage users to install the application to their home screen.

---

## 5. Deployment Architecture

### 5.1 Vercel (Frontend)
Vercel hosts the Next.js application. 
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables required: `NEXT_PUBLIC_API_URL` (points to the Render backend).

### 5.2 Render (Backend)
Render hosts the Node.js Express API.
- Managed via `render.yaml` (Infrastructure as Code).
- Environment Variables required: `MONGO_URI`, `JWT_SECRET`, `PUPPETEER_SKIP_DOWNLOAD`.
- Since Render free tier spins down on inactivity, the initial API request might take ~30 seconds (Cold Start). 

---

## 6. PDF Generation Logic Deep Dive

The PDF generation is one of the most complex parts of the system.
1. The client requests a PDF via `/api/reports/download/:id`.
2. The controller fetches the `Booking`, populated with `Patient`, `Test` details, and the `Report` results.
3. The data is passed to `utils/pdfGenerator.js`.
4. A raw HTML template string is populated with this data (using template literals).
5. Puppeteer launches a headless Chrome instance.
6. The HTML is set as the page content.
7. Puppeteer prints the page to a PDF buffer using `page.pdf({ format: 'A4', printBackground: true })`.
8. The Express response sends this buffer with headers `Content-Disposition: attachment; filename="report.pdf"` and `Content-Type: application/pdf`.

## End of Documentation
