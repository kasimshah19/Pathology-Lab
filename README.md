# Pathology Lab Management System

This project contains the Pathology Lab Management System, split into two main parts:
- `backend/`: Node.js + Express REST API
- `frontend/`: Next.js Web App + PWA

## Project Structure

- `backend/`
  - `config/`: Database connection and configuration
  - `controllers/`: Request handlers
  - `middleware/`: Custom middleware (auth, error handling)
  - `models/`: Mongoose schemas
  - `routes/`: API routes
  - `server.js`: Application entry point
- `frontend/`
  - `src/app/`: Next.js App Router pages
  - `src/components/`: Reusable React components
  - `src/context/`: React context providers (auth, etc.)
  - `src/lib/`: Helper functions (axios instance, etc.)

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Axios

## How to Run

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Copy `.env.local.example` to `.env.local`
4. `npm run dev`
