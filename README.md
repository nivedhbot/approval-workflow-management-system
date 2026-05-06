# Approval Workflow Management System

Full-stack approval system with JWT authentication, team-scoped request routing, AI-assisted request checks, revision workflow, requirement rules, and budget allocation/disbursement.

## What It Does

- Users can register and log in as `CREATOR` or `APPROVER`.
- Creators submit requests with category, priority, optional deadline, and optional requested amount.
- Approvers review only requests in their team.
- The backend runs auto-checks for duplicates and AI validation before a request becomes pending.
- Approvers can approve, reject, or request changes.
- Creators can resubmit revision-required requests.
- Approved requests with funding are allocated to a team budget and can be marked disbursed.
- Approvers can manage a requirements knowledge-base that guides AI validation.

## Tech Stack

### Backend

- Node.js, Express
- MongoDB, Mongoose
- JWT authentication
- bcryptjs password hashing
- OpenAI for request validation

### Frontend

- React 18
- Vite
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
    services/
    tests/

frontend/
    src/
        components/
        context/
        hooks/
        pages/
        services/
```

## Key Workflows

### Authentication

- Register and login with role-based access control.
- JWT is stored in `localStorage` under `fa_token`.
- The user profile is stored in `localStorage` under `fa_user`.

### Request Lifecycle

- `PENDING`
- `APPROVED`
- `REJECTED`
- `AUTO_REJECTED`
- `REVISION_REQUIRED`

### Budget Workflow

- Requests can include an optional `requestedAmount`.
- On approval, the backend allocates budget for the request.
- Approvers can later mark the allocated budget as disbursed.
- Team totals are tracked in the `Team` model and transaction history in `BudgetTransaction`.

### Requirements Knowledge-Base

- Approvers can create, update, activate, and deactivate requirement rules.
- Creators can read active requirements for guidance.
- The auto-check service includes active requirements in the AI prompt.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Requests

- `POST /api/requests` for creators
- `GET /api/requests/my-requests` for creators
- `GET /api/requests/pending` for approvers
- `GET /api/requests/reviewed` for approvers
- `PUT /api/requests/:id/approve` for approvers
- `PUT /api/requests/:id/reject` for approvers
- `PUT /api/requests/:id/request-changes` for approvers
- `PUT /api/requests/:id/resubmit` for creators
- `PUT /api/requests/:id/disburse` for approvers
- `PUT /api/requests/bulk-approve` for approvers
- `GET /api/requests/auto-rejected` for approvers

### Requirements

- `GET /api/requirements`
- `POST /api/requirements` for approvers
- `PUT /api/requirements/:id` for approvers
- `DELETE /api/requirements/:id` for approvers

## Local Setup

### Requirements

- Node.js 18+
- MongoDB Atlas URI or a local MongoDB instance

### 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

Run the backend:

```bash
npm start
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend runs on port 3000 and the backend runs on port 5000.

## Environment Notes

- The frontend uses `VITE_API_URL` when set, otherwise it falls back to `/api` and uses the Vite proxy.
- The backend now mounts `/api/auth` correctly and applies the auth rate limiter only outside test runs.
- If login fails in the browser, first confirm the backend is running on port 5000 and the frontend is pointing at the same API base URL.

## Current Repo Notes

- The backend includes tests under `backend/tests/`.
- The frontend dashboard pages support revision requests, budget display, and requirements browsing.
- The repo no longer needs a root-level npm manifest for the app itself.
