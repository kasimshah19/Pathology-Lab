<div align="center">

# Pathology Lab Management System

A comprehensive, full-stack, and PWA-enabled pathology laboratory management platform designed to digitize patient records, streamline test bookings, track sample lifecycles, and generate professional diagnostic reports.

> 📝 **Detailed Project Reference:** Check out the [**Comprehensive Project Details Document**](./PROJECT_DETAILS.md) for an in-depth look at features, architecture, setup instructions, and screenshots designed for your portfolio showcase.

<br />


![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-14A360?style=for-the-badge&logo=minutemailer&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
  - [Problem Statement](#problem-statement)
  - [Solution](#solution)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
  - [Architecture Diagram](#architecture-diagram)
  - [Architecture Components Table](#architecture-components-table)
- [Project Structure](#project-structure)
- [Features](#features)
- [Application Workflow](#application-workflow)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
  - [Data Models](#data-models)
- [Authentication & Authorization](#authentication--authorization)
- [Security Considerations](#security-considerations)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Deployment Guide](#deployment-guide)
- [UI / UX & Responsive Design](#ui--ux--responsive-design)
- [Performance & Error Handling](#performance--error-handling)
- [Code Quality & Testing](#code-quality--testing)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)
- [Architecture Decisions](#architecture-decisions)
- [Production Readiness](#production-readiness)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Project Metadata](#project-metadata)

---

## Project Overview

The Pathology Lab Management System is a modern web application tailored for diagnostic centers, hospitals, and independent pathology labs. It offers an end-to-end workflow starting from patient registration, test cataloging, and sample collection, to result entry and automated PDF report generation.

### Problem Statement

**The Challenge:**
Many small to medium-scale pathology laboratories still rely on manual ledger books or disconnected Excel sheets to manage patient data, book tests, and track samples. This manual workflow leads to:
- High probability of human error in transcribing patient details and test results.
- Difficulty in tracking the real-time status of a sample (e.g., Pending, Collected, Testing, Completed).
- Inefficient billing and payment tracking (Partial payments, Unpaid dues).
- Tedious report generation using MS Word templates which is time-consuming and inconsistent.
- No secure, role-based access control (receptionists having the same access as technicians or admins).

### Solution

**The Software Intervention:**
This project digitalizes the entire pathology workflow. It solves the aforementioned pain points by providing:
- **Centralized Database:** All patient history and test bookings are stored securely in a MongoDB database.
- **Role-Based Access Control (RBAC):** Admins can manage settings/users, receptionists can book tests and collect payments, and technicians can enter test results.
- **Automated Lifecycle Tracking:** Bookings move through structured statuses (`pending` -> `sample_collected` -> `testing` -> `completed`).
- **Automated PDF Generation:** Once a technician enters the results, the system instantly generates a professional PDF report with the lab's logo and headers/footers.
- **PWA Experience:** Staff can install the dashboard on their tablets or mobile devices as a Progressive Web App (PWA) for faster, native-like access.

---

## Live Demo

| Component | Hosting Platform | Description | Access Link | Status |
|-----------|-----------------|-------------|-------------|:------:|
| **Frontend UI** | Vercel | Next.js App Router (Dashboard, Modals, PWA) | [Live Frontend](https://pathology-lab-xl.vercel.app) | 🟢 Live |
| **Backend API** | Render | Node.js / Express.js REST API & PDF Engine | [Live API Base](https://pathology-lab-r16i.onrender.com) | 🟢 Live |
| **Database** | MongoDB Atlas | Cloud NoSQL Document Database | N/A (Internal) | 🟢 Live |

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14.2.3 (App Router) - Provides server-side rendering capabilities, fast routing, and SEO optimization.
- **Language:** JavaScript (ES6+) - Standard language for web logic.
- **Styling:** Tailwind CSS - Utility-first CSS framework for rapid UI development and responsive design.
- **Icons:** Lucide React - Clean, modern iconography.
- **State Management:** React Context API (`AuthContext`, `ToastProvider`) - Manages global authentication state and UI notifications.
- **Data Visualization:** Recharts - Renders responsive interactive charts for analytics.
- **PWA:** `@ducanh2912/next-pwa` - Implements service workers and manifest generation for offline capabilities and app installation.
- **HTTP Client:** Axios - Handles API requests to the backend with interceptors for token injection.
- **Date Formatting:** date-fns - Lightweight date manipulation and formatting library.

### Backend
- **Runtime:** Node.js - Fast, asynchronous runtime for the API.
- **Framework:** Express.js - Minimalist web framework for routing and middleware management.
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs - Secure password hashing and stateless session management.
- **Report Generation:** `pdf-lib` and `puppeteer` - Dynamically generates and manipulates PDF files for patient reports.
- **API Documentation:** `swagger-ui-express` & `swagger-jsdoc` - Interactive OpenAPI 3.0 documentation.
- **Email Notifications:** `nodemailer` - Sends automated HTML emails for booking confirmations and report readiness.
- **File Uploads:** `multer` & `cloudinary` - Streams patient photos and prescription documents directly to Cloudinary.
- **Data Export:** `json2csv` - Robust CSV parsing and stream generation for structured data exports.
- **Middleware:** CORS, Express JSON parser.

### Database
- **Database:** MongoDB
- **ODM:** Mongoose - Provides schema validation, relationship mapping, and pre-save hooks (e.g., auto-generating IDs).

### Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Version Control:** Git & GitHub

---

## System Architecture

The application follows a decoupled client-server architecture. The frontend is a Next.js application that communicates over HTTP/REST with an Express.js backend, which in turn reads/writes to a MongoDB database.

### Architecture Diagram

[View the full Architecture Diagram here](./ARCHITECTURE_DIAGRAM.md)

### Architecture Components Table

| Layer | Component | Technology | Responsibility |
|-------|-----------|------------|----------------|
| Client | UI / PWA | Next.js, Tailwind | Renders the dashboard, forms, and handles user interactions. |
| Client State | Global Context | React Context | Manages JWT tokens, user roles, and global toast notifications. |
| API Gateway | REST Endpoints | Express.js | Exposes structured routes for frontend consumption. |
| Security | Auth Middleware | JWT, bcryptjs | Validates tokens, checks user roles (admin, tech, receptionist). |
| Business Logic | Controllers | Node.js | Handles CRUD operations, status updates, and business rules. |
| PDF Engine | Report Generator | Puppeteer, pdf-lib| Converts test results and HTML templates into printable PDF reports. |
| Database | Data Store | MongoDB | Persistent storage for users, patients, tests, bookings, and reports. |

---

## Project Structure

```text
Blood Lab/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/              # Business logic (auth, bookings, patients, reports)
│   ├── middleware/               # Auth and role-verification middleware
│   ├── models/                   # Mongoose schemas (User, Patient, Test, Booking, Report)
│   ├── routes/                   # Express route definitions
│   ├── utils/
│   │   └── pdfGenerator.js       # Puppeteer PDF generation logic
│   ├── server.js                 # Express app entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── icons/                # PWA icons
│   │   └── manifest.json         # PWA manifest
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages (login, dashboard, settings)
│   │   ├── components/           # Reusable UI components (Modals, Nav, InstallPrompt)
│   │   ├── context/              # AuthContext for state management
│   │   └── lib/
│   │       └── api.js            # Axios configuration
│   ├── next.config.mjs           # Next.js & PWA configuration
│   ├── tailwind.config.js
│   └── package.json
├── render.yaml                   # Render deployment configuration
└── README.md
```

### Important Folders Explained
- **`backend/models/`**: Contains the exact data structures and validation rules for MongoDB. Includes pre-save hooks for generating custom IDs (e.g., `PAT-0001`, `BK-0002`).
- **`frontend/src/app/`**: Utilizes the modern Next.js App Router. Each folder represents a route (e.g., `/dashboard/patients`).
- **`frontend/src/components/`**: Houses modals (like `NewBookingModal`), navigation bars, and the aggressive `InstallPrompt` for the PWA.

---

## Features

### User & Role Management
- Secure Login with JWT.
- Self-service "Change Password" functionality available to all roles.
- Admin capabilities to add, edit (Name, Email, Phone), and activate/deactivate staff accounts.
- **Role-based views & permissions (RBAC)**: There are 3 types of logins in the system. All roles enter through a common login page (`/login`). Upon login, the backend JWT token identifies their role and dynamically renders the appropriate dashboard and menus:
  1. **Admin Login**:
     - Has full access to the system.
     - Can add new staff members (receptionists/technicians), manage the test catalog (add/edit/delete tests), and update basic lab settings (name, address, logo).
     - Full access to the **Analytics Dashboard** to monitor revenue trends.
     - Can view the comprehensive **Activity & Audit Log** of all staff actions.
     - Capability to **Export Data** (Patients and Bookings) to CSV.
  2. **Receptionist Login**:
     - Primarily handles the front desk operations.
     - Can register new patients, book tests, and update booking payment/status (e.g., 'sample_collected').
     - Does NOT have access to modify lab settings or staff details.
  3. **Technician Login**:
     - Focuses solely on laboratory technical work.
     - Responsible for entering patient test results into the system, checking normal/abnormal values, and marking reports as "ready".
     - Does NOT have access to create bookings or change lab settings.

### Patient Management
- Register new patients with demographics.
- Auto-generation of unique Patient IDs (`PAT-XXXX`).
- Upload and display patient profile photos (hosted via Cloudinary).
- Comprehensive Patient Detail Page displaying full profile and edit capabilities.
- View complete patient booking history with summary stats (total visits, amount spent) and clickable row navigation.

### Test Catalog
- Add, edit, and categorize diagnostic tests.
- Define test prices, normal ranges, and measurement units.
- Toggle active/inactive status for tests.

### Booking & Billing
- Create bookings mapping patients to multiple tests.
- Option to upload prescription or referral documents during booking creation.
- Auto-generation of Booking IDs (`BK-XXXX`).
- Track payment status (`paid`, `unpaid`, `partial`).
- Track booking lifecycle (`pending`, `sample_collected`, `testing`, `completed`).

### Result Entry & Reporting
- Technicians can enter specific result values against booked tests.
- Flag abnormal results automatically based on normal ranges.
- Generate high-quality PDF reports with lab headers, footers, and patient details using Puppeteer.

### Audit & Activity Logs
- Comprehensive tracking of critical events (e.g., `CREATE_PATIENT`, `UPDATE_PAYMENT_STATUS`, `DELETE_BOOKING`).
- Preserves the actor's username (even if deleted) for historical accuracy.
- Helps maintain accountability and compliance within the laboratory.

### Analytics & Reporting Dashboard
- Interactive charts powered by `recharts`.
- Visualize revenue aggregated by different periods (Last 7 Days, Last 30 Days, Last 12 Months).
- Smart aggregation pipeline in MongoDB ensures dates with zero bookings are appropriately zero-filled in the charts.

### Data Export (CSV)
- Admins can export structured data for Bookings and Patients directly to CSV formats.
- Respects active search and status filters, generating targeted reports for accounting or sharing.
- Automatically handles cell formatting (e.g. escaping phone numbers from scientific notation in Excel).

### Email Notifications
- Fully automated, asynchronous email dispatch using `nodemailer` and Gmail SMTP.
- Uses a secure proxy architecture: The Render backend forwards email data to a Vercel Serverless Function (`/api/send-email`) using a secure `EMAIL_API_SECRET` to bypass Render's Free Tier outbound SMTP restrictions.
- Sends a styled booking confirmation email detailing booked tests and total amount instantly after booking.
- Notifies patients when their report status changes to "report_ready".
- Fails gracefully without crashing the system if email is unconfigured or a network error occurs.

### PWA & Installation
- Installable as a native app on mobile and desktop.
- Aggressive custom install prompt overriding default browser behavior.

---

## Application Workflow

[View the Operational Flowchart (Workflow Diagram) here](./WORKFLOW_DIAGRAM.md)

### User Workflow

1. **Authentication:** User visits the app and logs in. `AuthContext` decodes the JWT and determines the role.
2. **Registration:** Receptionist navigates to Patients -> Adds a new patient.
3. **Booking:** Receptionist navigates to Bookings -> Selects Patient -> Selects Tests -> Collects payment -> Creates Booking (Status: `pending`).
4. **Sample Collection:** Phlebotomist collects blood/urine. Receptionist marks booking as `sample_collected`.
5. **Testing:** Technician sees the sample is collected, begins work, marks as `testing`.
6. **Result Entry:** Technician enters numerical/text values for the tests, adds remarks. Status becomes `completed`.
7. **Report Generation:** Admin/Receptionist clicks "Download Report". Backend generates a PDF dynamically.

## Documentation & Diagrams

To help understand the system design, check out these architectural diagrams:
- [**High-Level Architecture Diagram**](./ARCHITECTURE_DIAGRAM.md) - Explains the Client-Server split and deployment.
- [**System Workflow Diagram**](./WORKFLOW_DIAGRAM.md) - Shows the step-by-step operational flow of the lab.
- [**Data Flow Diagram (DFD)**](./DATAFLOW_DIAGRAM.md) - Illustrates how data moves between actors, processes, and databases.
- [**End-to-End Sequence Diagram**](./SEQUENCE_DIAGRAM.md) - Detailed technical sequence from booking to report generation.

---

## API Documentation

### Interactive Swagger UI
The project includes a built-in, interactive API documentation interface powered by **Swagger (OpenAPI 3.0)**.
- **Live Endpoint:** `GET /api-docs` (Available locally at [http://localhost:5000/api-docs/#/](http://localhost:5000/api-docs/#/) or on the deployed Render URL).
- **Features:** 
  - Visualize all available API endpoints, request body schemas, and expected responses.
  - Fully testable: Use the **Authorize** button to inject your JWT token, then click **Try it out** to execute live API calls directly from your browser (no Postman required).
- **Tech Used:** Uses `swagger-jsdoc` to generate documentation from inline JSDoc comments within the route files, and `swagger-ui-express` to serve the visual interface.

[View the comprehensive API Documentation & Endpoint Examples here](./API_DOCUMENTATION.md)

### Endpoints Overview
The backend exposes RESTful endpoints. All endpoints under `/api/` (except login) require a valid JWT Bearer token.

| Method | Endpoint | Authentication | Purpose |
|--------|----------|----------------|---------|
| POST | `/api/auth/login` | None | Authenticate user, returns JWT & user object. |
| GET | `/api/auth/me` | Required | Get current logged-in user profile. |
| PATCH | `/api/auth/change-password` | Required | Change own password for the logged-in user. |
| POST | `/api/auth/register` | Admin Only | Register a new staff member. |
| PUT | `/api/auth/users/:id` | Admin Only | Update basic details (name, email, phone) of a staff member. |
| GET | `/api/patients` | Required | Retrieve list of all patients. |
| POST | `/api/patients` | Required | Register a new patient. |
| GET | `/api/patients/export/csv` | Admin Only | Export patient records to a CSV file. |
| GET | `/api/tests` | Required | Retrieve test catalog. |
| POST | `/api/tests` | Admin Only | Add a new test to the catalog. |
| GET | `/api/bookings` | Required | Retrieve all bookings. |
| POST | `/api/bookings` | Required | Create a new booking. |
| PUT | `/api/bookings/:id/status`| Required | Update lifecycle status of a booking. |
| GET | `/api/bookings/export/csv`| Admin Only | Export booking records to a CSV file. |
| POST | `/api/reports` | Tech/Admin | Enter test results for a booking. |
| GET | `/api/reports/:bookingId/pdf`| Required | Generate and stream PDF report. |
| GET | `/api/settings` | Required | Fetch lab settings (name, logo, footer). |
| GET | `/api/activity-logs` | Admin Only | Fetch system activity/audit logs. |
| GET | `/api/analytics/revenue`| Admin Only | Aggregate booking data for revenue charts. |

---

## Database Design

The system uses MongoDB (NoSQL) to store document-based records. Mongoose provides a strict schema layer over it.

### MongoDB
MongoDB was chosen for its flexibility with document structures, allowing tests and reports to easily scale and adapt to different data types (e.g., text results vs. numerical results).

### Data Models

| Model / Collection | Purpose | Important Fields | Relationships |
|-------------------|---------|------------------|---------------|
| **User** | Staff authentication and RBAC | `email`, `password`, `role` | None directly, referenced by others. |
| **Patient** | Patient demographics | `patientId`, `name`, `age`, `phone` | Referenced by Bookings. |
| **Test** | Catalog of available diagnostics | `testCode`, `price`, `normalRange` | Referenced by Bookings & Reports. |
| **Booking** | Transactional record of a visit | `bookingId`, `status`, `paymentStatus` | References `Patient`, array of `Test`, and `User` (creator). |
| **Report** | Stores actual diagnostic results | `resultValue`, `isAbnormal`, `remarks` | References `Booking`, `Test`, and `User` (tech). |
| **ActivityLog** | System audit trail | `action`, `description`, `targetType` | References `User`. |
| **LabSettings** | Global configuration | `labName`, `logoUrl`, `address` | Singleton-style document. |

---

## Authentication & Role-Based Access Control (RBAC)

- **Mechanism:** JWT (JSON Web Tokens).
- **Role-Based Access Control (RBAC):** The system enforces strict access boundaries based on user roles:
  - **Admin:** Has unrestricted access to all modules, including Staff Management, Lab Settings, and the entire Test Catalog.
  - **Receptionist:** Can register patients, create bookings, and collect payments, but cannot modify lab settings or edit test catalog prices.
  - **Technician:** Authorized to process collected samples, enter diagnostic results, and mark reports as ready, but lacks administrative privileges.
- **Process:** User submits email/password -> Backend hashes password using `bcryptjs` and compares -> If valid, generates a JWT signed with `JWT_SECRET` encoding the user's role.
- **Frontend Storage:** The token is stored securely in `localStorage`.
- **Axios Interceptor:** Every outgoing API request from the frontend automatically attaches `Authorization: Bearer <token>` in the headers.
- **Route Protection & Enforcement:** 
  - **Frontend:** `ProtectedRoute` wrapper component intercepts rendering. It blocks unauthenticated users (redirecting to `/login`) and restricts UI elements based on the active role (e.g., hiding the Settings tab from Receptionists).
  - **Backend:** `protect` middleware validates token integrity. `authorize(...roles)` middleware restricts API endpoints at the network level (e.g., rejecting non-admin requests to `POST /api/tests`).

---

## Security Considerations & Production Hardening

- **Helmet Security Headers:** `helmet` middleware is implemented to automatically set crucial HTTP headers protecting against cross-site scripting (XSS), clickjacking, and other common vulnerabilities.
- **Rate Limiting:**
  - **Global Limit:** All `/api/` routes are protected by a general rate limiter (`express-rate-limit`) capped at 100 requests per 15 minutes per IP to prevent DoS attacks.
  - **Login Protection:** A strict limit of 5 attempts per 15 minutes is stacked specifically on the `/api/auth/login` endpoint to thwart brute-force password guessing.
- **CORS Configuration:** Strictly limited to the frontend production domain and localhost. It dynamically reads the allowed origin from the `FRONTEND_URL` environment variable, ensuring the API cannot be consumed by arbitrary third-party domains.
- **NoSQL Injection Protection:** Both Mongoose strict schemas and `express-mongo-sanitize` are used globally to strip dangerous operators (like `$` or `.`) from request bodies and query parameters.
- **Payload Limits:** `express.json` is configured with a strict `10mb` body size limit to prevent payload-based denial of service.
- **Error Scrubbing:** 500-level error messages in production return generic `"Server Error"` strings to the client to avoid leaking sensitive stack traces, DB connection strings, or variables, while full details are logged server-side.
- **Password Hashing & Stateless Auth:** `bcryptjs` hashes passwords and JWT manages sessions, preventing stateful hijacking.
- **Environment Variable Security:** Secrets are stored securely in environment variables (and Render's Vault), using `.env.example` as a template for developers without exposing credentials in version control.

---

## Environment Variables

### Backend (`backend/.env`)
Sensitive — never commit these values to version control.

```env
PORT=
MONGO_URI=
JWT_SECRET=
NODE_ENV=
PUPPETEER_SKIP_DOWNLOAD=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env.local`)
Must be configured in the deployment environment (Vercel Config).

```env
NEXT_PUBLIC_API_URL=
EMAIL_USER=
EMAIL_APP_PASSWORD=
EMAIL_API_SECRET=
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (Local or Atlas)
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pathology-lab
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example
   npm run dev
   ```
   *The backend will start on port 5000 (or as defined in `.env`).*

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create .env.local and set NEXT_PUBLIC_API_URL=http://localhost:5000/api
   npm run dev
   ```
   *The frontend will start on port 3000.*

---

## Deployment Guide

### Frontend Deployment — Vercel
1. Connect the GitHub repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Build Command: `npm run build`
5. In **Environment Variables**, add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://pathology-lab-r16i.onrender.com/api` (Actual Render URL)
   - Type: **Config** (Important: Do not set to Secret as the browser needs to read this).

### Backend Deployment — Render
The repository includes a `render.yaml` file for Infrastructure as Code (IaC) deployment.
1. Connect the repository to Render.
2. Render will automatically detect the Web Service defined in `render.yaml`.
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Provide Environment Variables in the Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PUPPETEER_SKIP_DOWNLOAD` (set to `true` if using Render's native chromium, otherwise leave blank).

---

## UI / UX & Responsive Design

- **Design System:** Built using Tailwind CSS, ensuring a clean, modern, and cohesive look (Slate and Teal color palette).
- **Responsive Layout:** The dashboard features a responsive sidebar that collapses on mobile devices, converting into a mobile-friendly bottom navigation bar or hamburger menu.
- **Modals & Forms:** Creating bookings and patients is handled via overlay modals to maintain context without unnecessary page reloads.
- **Feedback:** The custom `ToastProvider` gives immediate, color-coded feedback (success, error, warning) for all API interactions.

---

## Performance & Error Handling

### Performance Considerations
- **Server-Side Rendering (SSR):** Next.js pre-renders pages where applicable, improving initial load times.
- **PWA Caching:** Service workers cache static assets, allowing the UI to load instantly even on slow networks.
- **Database Indexing:** Mongoose schemas auto-generate unique indexes on `email`, `patientId`, and `bookingId` for rapid querying.

### Error Handling
- **API Errors:** The backend sends structured JSON error responses with proper HTTP status codes (400 for validation, 401 for auth, 404 for not found).
- **Frontend Catching:** Axios interceptors and `try/catch` blocks catch API errors and display them via the Toast UI, preventing the app from crashing.
- **Empty States:** Tables show user-friendly "No records found" messages instead of blank screens.

---

## Code Quality & Testing

- **Component Reusability:** Highly modular frontend. Modals, Buttons, and Layout wrappers are reused across pages.
- **Separation of Concerns:** Backend separates Routes, Controllers, and Models. PDF generation logic is isolated in a `utils` folder.
- **Linting:** ESLint is configured in the Next.js frontend to enforce code standards.

**Testing Framework:**
A robust automated testing suite is implemented for the backend using **Jest**, **Supertest**, and **MongoMemoryServer**.

- **In-Memory Database**: Tests run against a fast, isolated in-memory MongoDB instance ensuring real database data is never polluted.
- **Integration Tests**: Supertest is used to validate full REST API endpoints.
- **Coverage Focus**: Critical business paths are heavily tested:
  - **Auth Flow**: Registration, Login, Token generation, and Profile fetching.
  - **Patient Flow**: Secure patient creation, RBAC deletion checks (Admin vs Receptionist), and ID generation.
  - **Booking Flow**: Total amount calculation, booking status transitions, and data integrity checks.

*To run the test suite locally:*
```bash
cd backend
npm test
```

---

## Current Limitations

- **No Automated CI/CD:** Deployments are triggered automatically by commits, but there is no automated testing pipeline blocking bad commits.
- **PDF Generation Overhead:** Puppeteer is heavy. Generating PDFs synchronously on the main Node thread can block the event loop under extremely high load.
- **No Rate Limiting:** APIs are currently vulnerable to brute force without rate-limiting middleware.

---

## Future Improvements

### Short Term
- Implement pagination on the patients and bookings data tables to handle large datasets.
- Implement barcode generation for sample tubes based on `bookingId`.

### Medium Term
- Migrate PDF generation to a background worker process or use a lighter library than Puppeteer if Chromium instances become too heavy.
- Add WhatsApp or SMS API integration for notifying patients when reports are ready.
- Add an automated data backup script.

### Long Term
- Add a Patient Portal where patients can log in using their ID to download their own reports.
- Implement comprehensive analytics dashboards (Revenue over time, most frequent tests).

---

## Architecture Decisions

- **Why MongoDB?** Pathology results vary wildly in format. Some are numerical, some are long-form text (e.g., Biopsy reports). A NoSQL document structure accommodates this variance better than rigid SQL tables.
- **Why Next.js App Router?** It provides a highly optimized, modern React architecture. The ability to transition smoothly from server components to client components makes the dashboard fast and interactive.
- **Why Puppeteer?** While heavy, Puppeteer guarantees that the HTML/CSS template will render exactly as designed into a PDF, including complex CSS grid layouts and SVGs, which traditional PDF libraries struggle with.
- **Why Vercel API Proxy for Emails?** Render's Free Tier blocks outbound SMTP traffic on ports like 587 and 465, preventing direct email dispatch from the backend. To bypass this, the Next.js frontend (hosted on Vercel) exposes an API route (`/api/send-email`) that securely proxies email requests from the backend using an API secret. This ensures emails are delivered without requiring a paid Render plan.

---

## Production Readiness

| Area | Status | Notes |
|------|--------|-------|
| Authentication | Implemented | JWT is secure; brute-force protection (rate-limiting) is active. |
| Database | Implemented | MongoDB connected; ensure IP whitelisting in Atlas. |
| Security | Ready | Helmet, strict CORS, express-mongo-sanitize, and rate-limiting are fully active. |
| Deployment | Implemented | Vercel and Render connected via CI. |
| Error Handling | Implemented | Toast notifications and API error wrappers are active. |
| Testing | Implemented | Comprehensive Jest and Supertest suites covering critical paths (Auth, Patients, Bookings) are passing. |
| Performance | Implemented | Next.js and PWA caching ensure fast delivery. |
| Monitoring | Not Present | Needs integration with Sentry or Datadog for error tracking. |

---

## Troubleshooting

- **CORS Error on Login:** Ensure `NEXT_PUBLIC_API_URL` in Vercel is set to the exact Render URL without trailing slashes, and is set as "Config" (not Secret). Hard refresh the browser (`Ctrl+Shift+R`) to clear cached variables.
- **Database Connection Failed:** Ensure your current IP address is whitelisted in MongoDB Atlas Network Access settings.
- **PDF Generation Failing in Production (Render):** Render does not have Chrome installed by default. You may need to set `PUPPETEER_SKIP_DOWNLOAD=true` and configure the build environment to install Chromium, or use a Dockerfile.
- **PWA Not Installing:** Ensure the site is served over HTTPS and `manifest.json` is correctly linked in `layout.js`.
- **Email Not Sending:** If automated emails aren't arriving, ensure the `FRONTEND_URL` is set correctly in the Render environment variables, and `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `EMAIL_API_SECRET` are configured correctly in Vercel. Ensure you Redeploy Vercel after updating environment variables.

---

## Contributing

We welcome contributions to improve the Pathology Lab Management System.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Implement your changes.
4. Test locally.
5. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Project Metadata

| Property | Value |
|----------|-------|
| **Project** | Pathology Lab Management System |
| **Type** | Full-stack Web Application / PWA |
| **Frontend** | Next.js 14, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Deployment** | Vercel (Frontend) / Render (Backend) |
| **Status** | Production Ready (v1.0.0) |

---

**Author:** Kasim Shah  

### Connect with me:
- **Portfolio:** [kasim-portfolio-umber.vercel.app](https://kasim-portfolio-umber.vercel.app/)
- **LinkedIn:** [Kasim Shah](https://www.linkedin.com/in/kasim-shah-176175340/)
- **GitHub:** [@kasimshah19](https://github.com/kasimshah19)

<br />

<div align="center">
  <strong>&copy; 2026 Al-Hayat Diagnostic Lab — All rights reserved</strong>
</div>
