# Data Flow Diagram (DFD)

This diagram illustrates how information flows through the Pathology Lab Management System. It highlights how various actors (Admin, Receptionist, Technician) interact with the core entities (Patients, Bookings, Reports, Activity Logs).

```mermaid
graph TD
    %% Actors
    Admin([Admin])
    Receptionist([Receptionist])
    Technician([Technician])
    
    %% Main Processes (System Core)
    subgraph Data Flow
        PatientProcess(Patient Management)
        BookingProcess(Booking & Transactions)
        TestProcess(Test Catalog Management)
        ReportProcess(Diagnostics & Reporting)
        AnalyticsProcess(Analytics & Export)
        AuditProcess(System Auditing)
    end
    
    %% Databases / Storage
    DB_Patient[(Patients DB)]
    DB_Booking[(Bookings DB)]
    DB_Test[(Tests DB)]
    DB_Report[(Reports DB)]
    DB_Logs[(Activity Logs DB)]
    
    %% Actor Interactions -> Processes
    Admin -->|Manage Staff & Settings| AuditProcess
    Admin -->|CRUD| TestProcess
    Admin -->|View/Export| AnalyticsProcess
    
    Receptionist -->|Register| PatientProcess
    Receptionist -->|Create/Update| BookingProcess
    
    Technician -->|Enter Results| ReportProcess
    
    %% Processes -> Databases
    PatientProcess <-->|R/W| DB_Patient
    TestProcess <-->|R/W| DB_Test
    BookingProcess <-->|R/W| DB_Booking
    ReportProcess <-->|R/W| DB_Report
    AuditProcess --->|Write Only| DB_Logs
    AnalyticsProcess <---|Read Aggregated| DB_Booking
    
    %% Cross-Entity Flow
    BookingProcess -.-|Requires| DB_Patient
    BookingProcess -.-|Requires| DB_Test
    ReportProcess -.-|Requires| DB_Booking
    ReportProcess -.-|Requires| DB_Test
    
    %% Output Generation
    ReportProcess --> PDF[PDF Report Generation]
    AnalyticsProcess --> CSV[CSV Export Download]
    AnalyticsProcess --> UI[Dashboard Charts UI]
    
    %% Auditing side-effects
    PatientProcess -.->|Triggers Log| AuditProcess
    BookingProcess -.->|Triggers Log| AuditProcess
    ReportProcess -.->|Triggers Log| AuditProcess
    TestProcess -.->|Triggers Log| AuditProcess
```

## Description of Data Flows

1. **Patient Data:** Registered by the Receptionist. Stored in the `Patients DB`. Used by the Booking Process.
2. **Test Catalog Data:** Maintained by the Admin. Stored in the `Tests DB`. Used during booking creation and report generation to validate ranges and prices.
3. **Booking Data:** Generated when a patient pays for tests. Links `Patient` and `Tests` together. Updates lifecycle statuses (`pending`, `sample_collected`).
4. **Report Data:** Entered by Technicians against specific Bookings. Once completed, the system generates a downloadable PDF file merging patient info, lab settings, and result values.
5. **Auditing Flow:** Every mutating action (Create, Update, Delete) across the system automatically dispatches a payload to the `Activity Logs DB` to preserve a historical audit trail.
6. **Analytics Flow:** The Admin dashboard aggregates raw transactional data from the `Bookings DB` and processes it into visual charts or CSV exports for accounting purposes.
