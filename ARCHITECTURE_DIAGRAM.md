# Pathology Lab Management System - Architecture Diagram

This diagram illustrates the high-level decoupled client-server architecture of the application, showing how the Next.js frontend communicates with the Node.js/Express backend and MongoDB.

```mermaid
flowchart TB
    Client((Client Device\nBrowser / PWA))
    
    subgraph "Vercel (Frontend)"
        NextJS[Next.js App Router]
        AuthContext[Auth Context]
        Components[UI Components\nTailwind CSS]
        APIClient[Axios Interceptors]
    end
    
    subgraph "Render (Backend)"
        Express[Express.js API]
        AuthMiddleware[Auth & Role Middleware]
        Controllers[Business Logic Controllers]
        PDFGen[PDF Generator\nPuppeteer / pdf-lib]
    end
    
    subgraph "Database Tier"
        DB[(MongoDB)]
    end

    Client <-->|HTTPS / REST| NextJS
    NextJS --> AuthContext
    NextJS --> Components
    NextJS --> APIClient
    
    APIClient <-->|HTTPS / JSON| Express
    Express --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> PDFGen
    Controllers <-->|Mongoose ODM| DB
```
