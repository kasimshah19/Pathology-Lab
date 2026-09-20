# Data Flow Diagram (DFD)

This document provides a detailed breakdown of how data moves through the Pathology Lab Management System. It includes both a high-level Context Diagram (Level 0) and a more detailed Process Diagram (Level 1), along with the exact data payloads transferred between entities.

---

## 1. Level 0: Context Diagram

The Context Diagram shows the system as a single high-level process interacting with external entities (Actors).

```mermaid
graph TD
    %% External Entities (Actors)
    Admin([Admin])
    Receptionist([Receptionist])
    Technician([Technician])
    
    %% Main System
    System{{"Pathology Lab\nManagement System"}}
    
    %% Data Flows
    Admin -->|Login Credentials, Staff Details, Test Configurations| System
    System -->|System Analytics, Exported CSVs, Audit Logs| Admin
    
    Receptionist -->|Login Credentials, Patient Info, Booking Details, Payments| System
    System -->|Patient Records, Invoices, Booking Status| Receptionist
    
    Technician -->|Login Credentials, Test Results, Diagnostic Remarks| System
    System -->|Pending Bookings, Assigned Tests, Generated PDF Reports| Technician
```

---

## 2. Level 1: Detailed Process Data Flow

This diagram breaks down the main system into specific sub-processes and shows how they interact with the internal databases (MongoDB Collections).

```mermaid
graph TD
    %% External Entities
    Admin([Admin])
    Receptionist([Receptionist])
    Technician([Technician])
    
    %% Processes (Controllers/Routes)
    P1((1.0\nAuth & User\nManagement))
    P2((2.0\nPatient\nManagement))
    P3((3.0\nTest Catalog\nManagement))
    P4((4.0\nBooking &\nBilling))
    P5((5.0\nReport\nGeneration))
    P6((6.0\nAnalytics &\nAuditing))
    
    %% Data Stores (MongoDB)
    D1[(D1: Users DB)]
    D2[(D2: Patients DB)]
    D3[(D3: Tests DB)]
    D4[(D4: Bookings DB)]
    D5[(D5: Activity Logs DB)]
    
    %% Auth Flows
    Admin & Receptionist & Technician -->|Credentials| P1
    P1 <-->|Verify/Token| D1
    
    %% Admin Flows
    Admin -->|CRUD Test Details| P3
    P3 <-->|Test Schema| D3
    Admin -->|Request Dashboard Data| P6
    
    %% Receptionist Flows
    Receptionist -->|Patient Registration Data| P2
    P2 <-->|Patient Schema| D2
    
    Receptionist -->|Select Patient & Tests, Add Payment| P4
    P4 -->|Read Patient| D2
    P4 -->|Read Test Prices/Ranges| D3
    P4 <-->|Save Booking Schema| D4
    
    %% Technician Flows
    Technician -->|Fetch Pending Bookings| P4
    Technician -->|Submit Test Results| P5
    P5 -->|Update Status & Add Results| D4
    P5 -->|Generate PDF File| Technician
    
    %% Analytics & Logging Flows
    P6 -.->|Aggregate Revenue/Counts| D4
    
    %% Cross-cutting Audit Logging (Auto-triggered by processes)
    P1 & P2 & P3 & P4 & P5 -.->|Action, IP, UserID, Changes| D5
    P6 <-->|Read Audit Trail| D5
```

---

## 3. Data Payloads (What data is moving?)

To better understand the diagrams above, here is a breakdown of the exact data fields transferred during key processes:

### A. Patient Registration Flow
*   **Input (Receptionist -> System):** `name`, `age`, `gender`, `phone`, `email` (optional), `address`.
*   **Storage (System -> Patient DB):** Generates a unique `patientId` (e.g., `PT-0001`), adds `createdAt` and `updatedAt` timestamps.

### B. Test Catalog Flow
*   **Input (Admin -> System):** `testName`, `testCode`, `price`, `normalRange` (e.g., "70-110 mg/dL"), `isActive`.
*   **Storage (System -> Test DB):** Saves the test parameters used for billing and diagnostic validation.

### C. Booking & Payment Flow
*   **Input (Receptionist -> System):** `patientId`, array of `testIds`, `referredBy`, `totalAmount`, `paymentStatus` (paid/unpaid).
*   **Storage (System -> Booking DB):** Generates a unique `bookingId` (e.g., `BK-0001`). Sets initial status to `pending`. Embeds the current test prices to prevent historical invoice changes if a test price is updated later.

### D. Result Entry & Reporting Flow
*   **Input (Technician -> System):** `bookingId`, Array of results: `[{ testId, resultValue }]`, `remarks`.
*   **Process:** System checks `resultValue` against `normalRange` (from Tests DB). Status is updated from `pending` -> `completed`.
*   **Output (System -> User):** System merges Patient Info + Test Results into an HTML template and uses `puppeteer` to convert it into a downloadable PDF binary.

### E. Analytics & Auditing Flow
*   **Analytics (DB -> System -> Admin):** Uses MongoDB `$group` and `$sum` to calculate: Total Revenue, Total Bookings, Bookings by Status (pending vs completed), and Weekly Trends.
*   **Audit Logging (Any Process -> Log DB):** Captures `userId` (who did it), `action` (e.g., `CREATE_BOOKING`, `UPDATE_PATIENT`), `details` (what changed), `ipAddress`, and `timestamp`.
