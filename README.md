# Approval Workflow Management System

A full-stack SaaS application for managing multi-level approval workflows with role-based access control.

## Tech Stack

### Backend

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB (Atlas)
- **Auth:** JWT (JSON Web Tokens)
- **Security:** bcryptjs password hashing, role-based middleware

### Frontend

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS with glassmorphism design
- **Routing:** React Router v6
- **HTTP:** Axios with JWT interceptors

## Project Structure

```
├── backend/          # Express.js REST API
│   ├── config/       # Database configuration
│   ├── controllers/  # Route handlers
│   ├── middleware/    # Auth & role middleware
│   ├── models/       # Mongoose schemas
│   └── routes/       # API route definitions
│
└── frontend/         # React + Vite SPA
    └── src/
        ├── components/  # Reusable UI components
        ├── context/     # Auth context provider
        ├── hooks/       # Custom React hooks
        ├── pages/       # Route page components
        └── services/    # API service layer
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Configure your environment variables
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Features

- User registration with role selection (Creator / Approver)
- JWT-based authentication with auto-refresh
- Create, track, and manage approval requests
- Role-based dashboards for creators and approvers
- Self-approval/rejection prevention
- Glass morphism SaaS landing page
