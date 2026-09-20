# API Documentation

This document provides detailed information about the REST API endpoints available in the Pathology Lab Management System.

## Base URL
All API requests should be prefixed with the base URL:
```
http://localhost:5000/api
```
*(In production, this is your Render deployment URL: `https://pathology-lab-r16i.onrender.com/api`)*

## Authentication
Most endpoints require a valid JSON Web Token (JWT). To access protected endpoints, include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication & Users

### 1.1 Login
Authenticate a user (Admin, Receptionist, Technician) and receive a JWT.
- **URL:** `/auth/login`
- **Method:** `POST`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@test.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "_id": "60d5ecb54b...",
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "admin"
    }
  }
  ```

---

## 2. Patients

### 2.1 Get All Patients
Retrieve a list of all registered patients.
- **URL:** `/patients`
- **Method:** `GET`
- **Access:** Private (All roles)
- **Query Params:** `search` (Optional text search on name/phone)
- **Response (200 OK):** Array of Patient objects.

### 2.2 Export Patients (CSV)
Download a CSV file containing all patient records.
- **URL:** `/patients/export/csv`
- **Method:** `GET`
- **Access:** Private (Admin Only)
- **Query Params:** `search` (Optional)
- **Response (200 OK):** CSV File stream (`text/csv`).

---

## 3. Bookings & Reports

### 3.1 Create Booking
Create a new lab test booking for a patient.
- **URL:** `/bookings`
- **Method:** `POST`
- **Access:** Private (Admin, Receptionist)
- **Request Body:**
  ```json
  {
    "patient": "60d5ec...",
    "tests": ["60d5ed...", "60d5ee..."],
    "totalAmount": 1500,
    "paymentStatus": "paid",
    "referredBy": "Dr. Sharma"
  }
  ```
- **Response (201 Created):** The created Booking object.

### 3.2 Update Booking Status
Update the lifecycle status of a booking (e.g., from `pending` to `sample_collected`).
- **URL:** `/bookings/:id/status`
- **Method:** `PUT`
- **Access:** Private (All roles)
- **Request Body:**
  ```json
  {
    "status": "sample_collected"
  }
  ```

### 3.3 Export Bookings (CSV)
Download a CSV file containing booking records.
- **URL:** `/bookings/export/csv`
- **Method:** `GET`
- **Access:** Private (Admin Only)
- **Query Params:** `status`, `paymentStatus`, `search` (Optional)
- **Response (200 OK):** CSV File stream (`text/csv`).

### 3.4 Generate PDF Report
Generates and downloads the final diagnostic report in PDF format.
- **URL:** `/reports/:bookingId/pdf`
- **Method:** `GET`
- **Access:** Private (All roles)
- **Response (200 OK):** PDF File stream (`application/pdf`).

---

## 4. Analytics & Dashboard

### 4.1 Get Revenue Analytics
Retrieve aggregated booking revenue data for the dashboard charts.
- **URL:** `/analytics/revenue`
- **Method:** `GET`
- **Access:** Private (Admin Only)
- **Query Params:** `period` (Values: `7days`, `30days`, `12months`. Default: `30days`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "period": "7days",
    "data": [
      { "date": "2026-09-14", "revenue": 1200 },
      { "date": "2026-09-15", "revenue": 0 },
      { "date": "2026-09-16", "revenue": 3400 }
    ]
  }
  ```

---

## 5. Audit & Activity Logs

### 5.1 Get Activity Logs
Retrieve system-wide audit logs tracking staff actions.
- **URL:** `/activity-logs`
- **Method:** `GET`
- **Access:** Private (Admin Only)
- **Query Params:** `limit` (Default: 50)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 50,
    "data": [
      {
        "_id": "60d...",
        "action": "UPDATE_PAYMENT_STATUS",
        "description": "Updated booking BK-0004 payment status to paid",
        "userName": "Admin User",
        "userRole": "admin",
        "targetType": "Booking",
        "createdAt": "2026-09-20T10:15:30.000Z"
      }
    ]
  }
  ```
