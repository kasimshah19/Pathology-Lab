# Pathology Lab Management System - Sequence Diagram

This diagram illustrates the complete end-to-end workflow of the Pathology Lab Management System, showing the interactions between different roles (Receptionist, Technician, Admin) and the system components (Frontend, Backend API, Database, and PDF Engine).

```mermaid
sequenceDiagram
    autonumber
    actor Rec as Receptionist
    actor Tech as Technician
    actor Adm as Admin
    participant F as Frontend (Next.js)
    participant A as Backend API (Express)
    participant D as Database (MongoDB)
    participant P as PDF Engine (Puppeteer)

    %% Patient Registration & Booking
    Rec->>F: Register New Patient
    F->>A: POST /api/patients
    A->>D: Save Patient (PAT-XXXX)
    D-->>A: Patient Info
    A-->>F: 201 Created
    
    Rec->>F: Create Booking & Select Tests
    F->>A: POST /api/bookings
    A->>D: Save Booking (Pending)
    D-->>A: Booking ID (BK-XXXX)
    A-->>F: 201 Created

    %% Sample Collection
    Rec->>F: Mark Sample Collected
    F->>A: PUT /api/bookings/:id/status (sample_collected)
    A->>D: Update Booking Status
    A->>D: Log Activity (ActivityLog)
    A-->>F: 200 OK

    %% Testing & Results
    Tech->>F: Start Testing
    F->>A: PUT /api/bookings/:id/status (testing)
    A->>D: Update Booking Status
    A-->>F: 200 OK

    Tech->>F: Enter Test Results
    F->>A: POST /api/reports
    A->>D: Save Results
    A->>D: Update Booking Status (completed)
    A->>D: Log Activity (ActivityLog)
    A-->>F: 201 Created

    %% Report Generation
    Rec->>F: Download PDF Report
    F->>A: GET /api/reports/:id/pdf
    A->>D: Fetch Booking & Results
    A->>P: Render HTML Template
    P-->>A: Generated PDF Buffer
    A-->>F: 200 OK (application/pdf)

    %% Admin Features (Analytics & Export)
    Adm->>F: View Analytics Dashboard
    F->>A: GET /api/analytics/revenue
    A->>D: Aggregate Revenue Data
    A-->>F: 200 OK (Chart Data)

    Adm->>F: Export Bookings to CSV
    F->>A: GET /api/bookings/export/csv
    A->>D: Fetch Bookings
    A-->>F: 200 OK (text/csv)
```
