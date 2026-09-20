# 🩸 Pathology Lab Management System

A comprehensive, full-stack MERN application designed to digitize and streamline the workflow of diagnostic pathology laboratories. From secure role-based patient registration to automated test tracking, billing, and professional PDF report generation, this system provides a centralized platform for modern healthcare diagnostics.

---

## 🌐 Live Demo

- **Live Application:** [Insert Vercel URL Here]
- **API Documentation (Swagger):** [Insert Render URL Here]/api-docs

**Demo Credentials:**
- **Admin:** `admin@example.com` / `password123` (Replace with actual)
- **Receptionist:** `receptionist@example.com` / `password123` (Replace with actual)
- **Technician:** `technician@example.com` / `password123` (Replace with actual)

---

## ✨ Features

- **Authentication & Authorization**
  - Secure JWT-based authentication.
  - Role-Based Access Control (RBAC) with 3 distinct roles: Admin, Receptionist, Technician.
- **Patient Management**
  - Complete CRUD operations for patient records.
  - Auto-generated, sequential Patient IDs.
- **Test Catalog Management**
  - Maintain a centralized directory of available tests, pricing, and normal ranges.
- **Booking & Sample Lifecycle Tracking**
  - End-to-end tracking: `Pending` → `Sample Collected` → `Testing` → `Completed`.
- **Automated PDF Reports & Invoices**
  - Dynamic generation of professional patient reports and invoices using `pdf-lib`.
- **Analytics Dashboard**
  - Interactive charts (via `recharts`) tracking revenue trends, booking volume, and popular tests.
- **Activity / Audit Logging**
  - Immutable audit trails tracking critical staff actions across the system.
- **Data Export**
  - Export patient and booking data to CSV for external accounting or analysis.
- **Email Notifications**
  - Automated transactional emails powered by Nodemailer (booking confirmations, report readiness).
- **File Uploads**
  - Direct integration with Cloudinary for secure storage of prescriptions and profile photos.
- **Progressive Web App (PWA)**
  - Installable on mobile devices with a native-feeling bottom navigation bar for on-the-go access.
- **Security Hardening**
  - API rate limiting, Helmet for HTTP headers, Mongo sanitization against NoSQL injection, and strict CORS.
- **Automated Testing**
  - Comprehensive Jest and Supertest backend test suite featuring 26 passing tests utilizing `mongodb-memory-server`.

---

## 💻 Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Recharts, Axios, PWA |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **File Storage** | Cloudinary |
| **Email Service** | Nodemailer (Gmail SMTP) |
| **PDF Generation** | pdf-lib |
| **Testing** | Jest, Supertest, mongodb-memory-server |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 🏗️ System Architecture

```text
 ┌─────────────────────────┐             ┌─────────────────────────┐
 │                         │             │                         │
 │     Frontend (PWA)      │    REST     │       Backend API       │
 │   Next.js on Vercel     │ ◄─────────► │    Express on Render    │
 │                         │             │                         │
 └───────────┬─────────────┘             └──────┬───────────┬──────┘
             │                                  │           │
             │                                  │           │
             ▼                                  ▼           ▼
 ┌─────────────────────────┐     ┌────────────────┐   ┌────────────────┐
 │                         │     │                │   │                │
 │      Client Browser     │     │ Cloudinary API │   │   Gmail SMTP   │
 │   (Mobile / Desktop)    │     │ (File Storage) │   │ (Nodemailer)   │
 │                         │     │                │   │                │
 └─────────────────────────┘     └────────────────┘   └────────────────┘
                                        ▲
                                        │
                                        ▼
                             ┌─────────────────────────┐
                             │                         │
                             │       Database          │
                             │      MongoDB Atlas      │
                             │                         │
                             └─────────────────────────┘
```

---

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login.png)
*Secure portal with role-based routing upon successful authentication.*

### Admin Dashboard
![Dashboard](screenshots/dashboard.png)
*Centralized view of lab statistics and recent bookings.*

### Patient Management
![Patients Page](screenshots/patients.png)
*Comprehensive list of registered patients with quick-action menus.*

### Booking Workflow
![Booking Workflow](screenshots/booking.png)
*Intuitive multi-step process for selecting tests and processing payments.*

### Analytics Dashboard
![Analytics Dashboard](screenshots/analytics.png)
*Interactive charts displaying revenue trends and operational volume.*

### Sample PDF Report
![Sample PDF Report](screenshots/pdf-report.png)
*Automated, professionally formatted test results document.*

---

## 🚀 Getting Started / Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Account (or local MongoDB)
- [Cloudinary](https://cloudinary.com/) Account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pathology-lab.git
cd pathology-lab
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration
EMAIL_USER=your_gmail_address
EMAIL_APP_PASSWORD=your_gmail_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:3000
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Running Tests
The backend features a robust test suite using an in-memory database.
```bash
cd backend
npm test
```

---

## 📡 API Endpoints Overview

| Group | Methods | Base Route | Description |
|---|---|---|---|
| **Auth** | `POST`, `GET`, `PATCH` | `/api/auth` | Login, registration, profile fetching, password updates. |
| **Patients** | `GET`, `POST`, `PUT`, `DELETE` | `/api/patients` | Patient CRUD operations and CSV export. |
| **Tests** | `GET`, `POST`, `PUT`, `DELETE` | `/api/tests` | Manage diagnostic test catalog and pricing. |
| **Bookings** | `GET`, `POST`, `PATCH` | `/api/bookings` | Create bookings, track lifecycle status, update payments. |
| **Reports** | `POST`, `GET`, `PATCH` | `/api/reports` | Enter test results, mark ready, stream final PDF reports. |
| **Analytics**| `GET` | `/api/analytics` | Aggregate data for dashboard charts (Revenue/Volume). |
| **Logs** | `GET` | `/api/activity-logs` | Fetch system-wide audit trails for security monitoring. |
| **Settings** | `GET`, `PUT` | `/api/settings` | Manage global lab configuration (Logo, Name, Address). |

---

## 📂 Project Structure

```text
Blood Lab/
├── backend/
│   ├── config/          # DB connection, Swagger config
│   ├── controllers/     # Route logic / Request handlers
│   ├── middleware/      # Auth (JWT), RBAC, Error handling
│   ├── models/          # Mongoose DB schemas
│   ├── routes/          # Express API route definitions
│   ├── tests/           # Jest/Supertest suite & setup files
│   ├── utils/           # PDF generation, Email dispatchers
│   ├── server.js        # Express app entry point
│   └── package.json
└── frontend/
    ├── public/          # Static assets, PWA Manifest, Icons
    ├── src/
    │   ├── app/         # Next.js App Router (Pages & Layouts)
    │   ├── components/  # Reusable UI components (Modals, Charts)
    │   ├── context/     # React Context (Auth State)
    │   └── lib/         # Axios API configuration
    ├── tailwind.config.js
    └── package.json
```

---

## 🛡️ Role-Based Access Control (RBAC)

| Feature | Admin | Receptionist | Technician |
|---|:---:|:---:|:---:|
| **Login & Profile Management** | ✅ | ✅ | ✅ |
| **View Patients & Bookings** | ✅ | ✅ | ✅ |
| **Create/Edit Patients** | ✅ | ✅ | ❌ |
| **Create/Process Bookings** | ✅ | ✅ | ❌ |
| **Collect Payments** | ✅ | ✅ | ❌ |
| **Enter Test Results** | ✅ | ❌ | ✅ |
| **Manage Test Catalog** | ✅ | ❌ | ❌ |
| **Manage Staff Accounts** | ✅ | ❌ | ❌ |
| **View Analytics & Logs** | ✅ | ❌ | ❌ |
| **Export Data to CSV** | ✅ | ❌ | ❌ |

---

## 🔮 Future Enhancements

- **Real-time Notifications:** Implement WebSockets (Socket.io) to instantly notify receptionists when a technician marks a report as ready.
- **Patient Self-Service Portal:** Allow patients to log in securely using their ID and Phone number to download past reports.
- **Multi-Branch Support:** Scale the database architecture to support multiple laboratory locations under a single organization.
- **SMS Integration:** Integrate Twilio API to send SMS alerts for booking confirmations and report availability.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/pathology-lab/issues).

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kasim Shah**

- 📧 Email: [kasimshah998@gmail.com](mailto:kasimshah998@gmail.com)
- 🌐 Portfolio: [kasim-portfolio-umber.vercel.app](https://kasim-portfolio-umber.vercel.app/)
- 🐙 GitHub: [@kasimshah19](https://github.com/kasimshah19)
- 💼 LinkedIn: [Kasim Shah](https://www.linkedin.com/in/kasim-shah-176175340/)

---
*If you like this project, please consider giving it a ⭐ on GitHub!*
