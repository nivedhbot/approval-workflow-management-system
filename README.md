# Approval Workflow Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB.svg)
![Node.js](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248.svg)

A full-stack approval management system featuring role-based access control, team-scoped request routing, automated validation, revision workflows, requirement rules, and budget tracking.

**Live Demo:** [https://approval-workflow-management-system.vercel.app](https://approval-workflow-management-system.vercel.app)

---

## Key Features

*   **Role-Based Access:** Dedicated interfaces for `CREATOR` and `APPROVER` roles.
*   **Automated Checks:** Automated validation and duplicate detection before requests enter the pending queue.
*   **Revision Workflows:** Approvers can request changes; creators can resubmit.
*   **Budget Management:** Allocate funds to approved requests and track team disbursements.
*   **Knowledge Base:** Maintain requirement rules that guide the validation engine.
*   **Security:** JWT authentication, bcrypt password hashing, and rate limiting.

---

## Technology Stack

**Frontend**
*   React 18
*   Vite
*   React Router v6
*   Tailwind CSS
*   Axios

**Backend**
*   Node.js
*   Express
*   MongoDB / Mongoose
*   JWT / bcryptjs
*   OpenAI API

---

## Getting Started Locally

### Prerequisites
*   Node.js 18+
*   MongoDB Atlas URI (or local MongoDB instance)
*   OpenAI API Key

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
```

Start the backend server:
```bash
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Note: The frontend uses `vite.config.js` to automatically proxy `/api` requests to the local backend on port 5000.*

---

## Repository Structure

```
├── backend/            # Express REST API, MongoDB models, integrations
├── frontend/           # React 18, Vite, Tailwind CSS application
└── render.yaml         # Blueprint for Render deployment
```

---

## Deployment

*   **Frontend:** Deployed via Vercel.
*   **Backend:** Hosted on Render.

To deploy the frontend to Vercel, connect the GitHub repository and set the Vercel Root Directory to `frontend`.
