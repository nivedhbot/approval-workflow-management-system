# Approval Workflow Management System

Full-stack approval system with role-based access, JWT authentication, and MongoDB persistence.

## Stack

### Backend

- Node.js, Express
- MongoDB, Mongoose
- JWT authentication
- bcryptjs password hashing

### Frontend

- React 18, Vite
- React Router v6
- Axios
- Tailwind CSS

## Repository Structure

```
backend/
    config/
    controllers/
    middleware/
    models/
    routes/

frontend/
    src/
        components/
        context/
        pages/
        services/
```

## Core Functionality

- Register and login with role: CREATOR or APPROVER
- Role-protected API routes and UI routes
- Request lifecycle: PENDING, APPROVED, REJECTED
- Self-approval prevention
- Team-scoped routing of requests using teamId

## Team Scope Behavior

- Users have teamId (default: general)
- New requests inherit creator teamId
- Approvers only see pending requests from their own team
- Approvers cannot approve or reject requests from another team

## API Endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Requests

- POST /api/requests (CREATOR)
- GET /api/requests/my-requests (CREATOR)
- GET /api/requests/pending (APPROVER)
- PUT /api/requests/:id/approve (APPROVER)
- PUT /api/requests/:id/reject (APPROVER)

## Local Setup

### Requirements

- Node.js 18+
- MongoDB Atlas URI or local MongoDB

### 1) Backend

```bash
cd backend
npm install
```

Create backend/.env:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

Run backend:

```bash
npm start
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

By default, frontend runs on port 3000 and backend on port 5000.

## Notes

- JWT and user profile are stored in localStorage keys: fa_token and fa_user
- Requests and approvals are database-backed (no in-memory state)
