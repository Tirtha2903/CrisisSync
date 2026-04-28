# 🚨 CrisisSync — Rapid Crisis Response System

A **MERN Stack** real-time emergency response and crisis coordination platform for hospitality venues.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongod`)

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 👥 User Roles

| Role  | Access |
|-------|--------|
| **Guest** | Press SOS button, track own incidents |
| **Staff** | View live alerts, accept & resolve incidents |
| **Admin** | Full dashboard, stats, all incident history |

---

## 🔑 How to Test

1. Open `http://localhost:5173`
2. Register as **Staff** in one browser tab
3. Register as **Guest** in another browser tab (or incognito)
4. As Guest: Press the 🆘 SOS button and fill in the form
5. As Staff: Watch the new alert appear **instantly** in real-time!

---

## 🏗️ Tech Stack

- **MongoDB** — Database
- **Express.js** — REST API
- **React.js + Vite** — Frontend
- **Node.js** — Backend runtime
- **Socket.io** — Real-time WebSocket communication
- **JWT** — Authentication

## 📁 Project Structure

```
Project2/
├── server/          # Express + Socket.io backend
│   ├── models/      # MongoDB Mongoose models
│   ├── routes/      # API routes
│   ├── middleware/  # JWT auth middleware
│   └── index.js    # Entry point
│
└── client/          # React + Vite frontend
    └── src/
        ├── context/ # Auth & Socket contexts
        ├── pages/   # Guest / Staff / Admin dashboards
        ├── components/ # Reusable UI components
        └── api/     # Axios instance
```
