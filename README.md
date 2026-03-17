# TaskFlow - Modern Task Management App

A production-ready full-stack Task Management application built with **Next.js 15 (App Router)** and **MongoDB**. This project focuses on high security, clean architecture, and a modern UI using glassmorphism and dark mode aesthetics.

## Features
- **Full CRUD functionality:** Create, read, update, delete tasks.
- **Advanced Filtering & Search:** Real-time search by title and filtering by task status (Todo, In-progress, Done) with debounce filtering.
- **Pagination:** Server-side pagination for optimized performance.
- **Robust Authentication:** Secure JWT-based authentication using HTTP-Only cookies.
- **Data Encryption:** Advanced AES-256 encryption for sensitive API payloads between client and server.
- **Protected Routes:** Next.js middleware guards protected pages like the dashboard.
- **Beautiful UI:** Custom, modern CSS styling with glassmorphism, gradients, and micro-animations.

---

## 🏗️ Architecture Explanation

The application follows a standard Next.js Full Stack architecture:

### 1. Frontend (Client-side)
* **Next.js App Router**: Powers the UI using Server and Client components. The dashboard is a fully interactive Client component (`'use client'`) to handle state like modals, search, and pagination.
* **State Management**: Built-in React hooks (`useState`, `useEffect`, `useCallback`).
* **Styling**: Pure CSS with CSS variables (`globals.css`) implemented without third-party libraries for maximum control and zero bloat, emphasizing modern dark-mode palettes.
* **Payload Decryption**: Responses from secure API routes are encrypted via AES. The frontend decrypts these payloads using `crypto-js` before rendering the data.

### 2. Backend (Server-side API Routes)
* **Next.js API Routes**: Serverless functions handling HTTP requests (`/api/auth/*` and `/api/tasks/*`).
* **Database**: MongoDB connected via Mongoose ODM. Connection pooling is utilized to prevent connection leaks during hot-reloads and serverless deployments.
* **Security & Auth Layer**:
  * Passwords are irreversibly hashed using `bcryptjs` before hitting the database.
  * Successful logins issue a **JWT (JSON Web Token)**.
  * The JWT is securely stored in an **HTTP-Only, Secure, SameSite=Strict cookie**, preventing XSS token theft.
  * API responses wrap sensitive data (like user info and task structures) inside an **AES-256 encrypted payload**.
* **Middleware**: `src/middleware.js` intercepts all navigation events, verifying the existence of the secure token cookie before granting access to `/dashboard`.

---

## 🛠️ Setup Instructions

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas account (or a local MongoDB instance)

### 1. Clone & Install
```bash
git clone <repository-url>
cd taskmanager
npm install
```

### 2. Environment Variables
Create a file named `.env.local` in the root of the `taskmanager` directory and add the following variables:

```env
# MongoDB Connection String (Replace with your actual credentials and cluster)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskmanager?retryWrites=true&w=majority

# JWT Secret for signing tokens (You can generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# AES-256 Secrets for Payload Encryption (Both must match)
AES_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
NEXT_PUBLIC_AES_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2

# Environment Mode
NODE_ENV=development
```

> **Note:** The AES secret must be identical in both `AES_SECRET` (backend) and `NEXT_PUBLIC_AES_SECRET` (frontend).

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Key Project Structure

```text
taskmanager/
├── src/
│   ├── app/
│   │   ├── api/          # Backend API Routes (Auth, Tasks)
│   │   ├── dashboard/    # Protected Dashboard UI
│   │   ├── login/        # Login Page
│   │   ├── register/     # Registration Page
│   │   ├── globals.css   # Main stylesheet (Design System)
│   │   ├── layout.js     # Root HTML layout
│   │   └── page.js       # Landing page Hero
│   ├── lib/
│   │   ├── apiUtils.js   # Validation and Error handling
│   │   ├── auth.js       # JWT & Cookie generation logic
│   │   ├── encryption.js # AES crypto helpers
│   │   └── mongodb.js    # Mongoose connection singleton
│   ├── models/
│   │   ├── Task.js       # MongoDB Task Schema
│   │   └── User.js       # MongoDB User Schema
│   └── middleware.js     # Next.js Route Protection
└── .env.local            # Environment Secrets
```
