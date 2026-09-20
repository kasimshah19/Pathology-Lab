# Pathology Lab Management System - Workflow Diagram

This diagram illustrates the step-by-step operational workflow inside the diagnostic laboratory, from the moment a patient arrives to the delivery of their final PDF report.

```mermaid
flowchart TD
    A[Start: Patient Arrives] --> B[Patient Registration]
    B --> C[Test Booking & Payment Collection]
    
    C --> D{Payment Status}
    D -->|Unpaid| C
    D -->|Paid / Partial| E[Status: Pending]
    
    E --> F[Phlebotomist Collects Sample]
    F --> G[Status: Sample Collected]
    
    G --> H[Sample Sent to Laboratory]
    H --> I[Technician Starts Testing]
    I --> J[Status: Testing]
    
    J --> K[Technician Enters Results]
    K --> L[System Highlights Abnormal Values]
    L --> M[Status: Completed]
    
    M --> N[Generate & Download PDF Report]
    N --> O[End: Deliver Report to Patient]

    %% Optional Admin flows branching out
    C -.-> P([Admin: Export Bookings CSV])
    N -.-> Q([Admin: View Revenue Analytics])
```
