# 💬 ChatApp — Enterprise Real-Time Chat & Progressive Web Application (PWA)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101.svg)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)

A high-performance, enterprise-grade, full-stack real-time communication platform built with the **MERN** stack (**MongoDB, Express.js, React, Node.js**) and **Socket.IO**. Designed with an **offline-first Progressive Web App (PWA)** architecture, multi-factor **6-Digit Email OTP Verification**, **Google OAuth 2.0 Single Sign-On (SSO)**, and dynamic cryptographic password reset mechanisms.

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [System Architecture & Workflow](#-system-architecture--workflow)
- [Technology Stack](#-technology-stack)
- [Database Schema Design](#-database-schema-design)
- [API Reference](#-api-reference)
- [Socket.IO Real-Time Events](#-socketio-real-time-events)
- [Security & Authentication Hardening](#-security--authentication-hardening)
- [Progressive Web App (PWA) Capabilities](#-progressive-web-app-pwa-capabilities)
- [Local Development Setup](#-local-development-setup)
- [Production Deployment](#-production-deployment)
- [Engineering Highlights & ATS Keywords](#-engineering-highlights--ats-keywords)

---

## 🚀 Executive Overview

ChatApp provides seamless, low-latency, bidirectional one-on-one instant messaging. It combines modern UI/UX with strict security principles—eliminating unverified or disposable accounts through mandatory email verification and robust cryptographic protocols. It functions both as an ultra-fast web application and an installable native desktop/mobile Progressive Web App.

---

## 🌟 Key Features

### 1. Real-Time Communication Engine
* **Sub-Millisecond Message Delivery**: Powered by persistent Socket.IO WebSocket connections.
* **Live Message Status Receipts**: Real-time tracking of message progression: `sent` ➔ `delivered` ➔ `read`.
* **Dynamic Typing Indicators**: Instant typing feedback with client-side debouncing to optimize network traffic.
* **Presence & Activity Tracking**: Real-time online/offline indicators and precise `lastSeen` timestamps.

### 2. Enterprise Authentication & Verification
* **6-Digit OTP Email Verification**: Enforces proof of inbox ownership upon registration; dummy or inaccessible email addresses cannot activate accounts.
* **Disposable / Temp-Mail Filter**: Rejects disposable email providers (`tempmail.com`, `mailinator.com`, etc.) at the gateway.
* **Google OAuth 2.0 Integration**: Frictionless one-click authentication verifying Google-backed email identities.
* **Cryptographic Password Reset**: 15-minute expiring SHA-256 tokens with **dynamic origin resolution**, ensuring email links automatically target the user's active client environment (development ports, preview URLs, or production domains).
* **JWT & Bcrypt Security**: Salted SHA password hashing and signed JSON Web Tokens for stateless authorization.

### 3. Progressive Web App (PWA)
* **Installable Application**: Fully installable on iOS, Android, macOS, and Windows with standalone display.
* **Service Worker Caching**: Intelligent caching strategy via Workbox for instant asset loading and offline resilience.
* **Cross-Platform Responsive Design**: Mobile-first, adaptive interface supporting touch gestures, custom modals, and high-DPI displays.

---

## 🏗️ System Architecture & Workflow

### End-to-End System Topology

```
                                  [ USER CLIENTS ]
                           Desktop Web | Mobile App (PWA)
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                  [ HTTPS / REST ]             [ WSS / WebSockets ]
                   Axios Client                 Socket.IO Client
                         │                             │
                         ▼                             ▼
               ┌──────────────────────────────────────────────┐
               │              EXPRESS.JS SERVER               │
               │   • JWT Middleware      • CORS Dynamic Origin │
               │   • Rate Limiting       • Controller Logic   │
               │   • Nodemailer Worker   • WebSocket Gateway  │
               └──────────────┬───────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
        [ MONGODB ATLAS ]           [ GOOGLE / GMAIL API ]
     • Users Collection              • OAuth 2.0 Token Audit
     • Conversations Collection      • Transactional SMTP OTPs
     • Messages Collection           • Password Reset Dispatch
```

---

### Detailed Workflow Diagrams

#### A. Registration & 6-Digit OTP Verification Workflow
```
[ User ]           [ React Frontend ]          [ Express Backend ]         [ Gmail SMTP ]       [ MongoDB ]
   │                       │                            │                         │                 │
   │── Enters details ────>│                            │                         │                 │
   │   (name, email, pass) │── POST /auth/register ────>│                         │                 │
   │                       │                            │── Check Disposable ────>│                 │
   │                       │                            │── Gen 6-digit OTP ─────>│                 │
   │                       │                            │── Send OTP Email ──────>│                 │
   │                       │                            │                         │── Sends Email ─>│ [User Inbox]
   │                       │                            │── Save unverified user ──────────────────>│ (isVerified: false)
   │                       │<── { requireOtp: true } ───│                         │                 │
   │<── Renders OTP Form ──│                            │                         │                 │
   │                       │                            │                         │                 │
   │── Enters OTP Code ───>│                            │                         │                 │
   │                       │── POST /auth/verify-otp ──>│                         │                 │
   │                       │                            │── Verify SHA-256 Hash ───────────────────>│
   │                       │                            │── Set isVerified: true ──────────────────>│
   │                       │<── { token, userProfile } ─│                         │                 │
   │<── Login & Redirect ──│                            │                         │                 │
```

#### B. Real-Time Message Exchange & Read Receipt Workflow
```
[ Sender (Client A) ]       [ Node/Socket.IO Server ]       [ MongoDB Atlas ]      [ Receiver (Client B) ]
         │                              │                           │                        │
         │─── emit('sendMessage') ─────>│                           │                        │
         │                              │─── Save message ─────────>│                        │
         │                              │    (status: 'sent')       │                        │
         │                              │                           │                        │
         │                              │─── emit('receiveMessage') ────────────────────────>│
         │<── emit('messageDelivered') ─│                                                    │
         │    (status: 'delivered')     │                                                    │
         │                              │<── emit('messageRead') ────────────────────────────│
         │<── emit('messageRead') ──────│                                                    │
         │    (status: 'read')          │─── Update status: 'read' ─>│                        │
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Socket.IO Client, CSS3 Variables, Workbox PWA |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose ODM, JSON Web Tokens (JWT), Bcrypt.js, Crypto |
| **External Services** | MongoDB Atlas, Nodemailer (Google SMTP Transport), Google OAuth 2.0 API |
| **Tooling & DevOps** | Vite PWA Plugin, Git, npm, Vercel (Frontend Hosting), Render (Backend Hosting) |

---

## 🗄️ Database Schema Design

### 1. User Entity (`User.js`)
```javascript
{
  name:                { type: String, required: true, trim: true },
  username:            { type: String, required: true, unique: true, index: true },
  email:               { type: String, required: true, unique: true, index: true },
  password:            { type: String, select: false }, // Bcrypt hash
  avatar:              { type: String, default: '' },
  googleId:            { type: String, default: null },
  isVerified:          { type: Boolean, default: false },
  otp:                 { type: String, select: false }, // SHA-256 hashed code
  otpExpire:           { type: Date, select: false },
  resetPasswordToken:  { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  isOnline:            { type: Boolean, default: false },
  lastSeen:            { type: Date, default: Date.now }
}
```

### 2. Conversation Entity (`Conversation.js`)
```javascript
{
  participants:  [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage:   { type: Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date, default: Date.now }
}
```

### 3. Message Entity (`Message.js`)
```javascript
{
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text:           { type: String, required: true, trim: true },
  status:         { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}
```

---

## 📡 API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new account & trigger 6-digit OTP email | No |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP and issue JWT session | No |
| `POST` | `/api/auth/resend-otp` | Re-generate and dispatch new OTP to email | No |
| `POST` | `/api/auth/login` | Authenticate user credentials & return JWT | No |
| `POST` | `/api/auth/google` | Verify Google ID Token & create/login user | No |
| `POST` | `/api/auth/forgot-password` | Dispatch dynamic reset link to registered email | No |
| `POST` | `/api/auth/reset-password/:token` | Validate token and update user password | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user identity | Yes (Bearer) |

### User Management (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/users` | List contacts and recent conversations | Yes |
| `GET` | `/api/users/search?q=:query` | Search verified platform users by name/username | Yes |
| `GET` | `/api/users/online` | Retrieve currently active/connected users | Yes |

### Messaging & Conversations (`/api/messages`, `/api/conversations`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/conversations` | Retrieve all user conversations with last message | Yes |
| `POST` | `/api/conversations` | Initialize conversation with a participant | Yes |
| `GET` | `/api/messages/:conversationId` | Fetch paginated chat history for conversation | Yes |
| `PATCH` | `/api/messages/:id/read` | Mark message as read | Yes |

---

## ⚡ Socket.IO Real-Time Events

### Client ➔ Server
* `userOnline(userId)`: Registers socket connection with user ID.
* `sendMessage({ conversationId, receiverId, text })`: Transmits message payload for delivery.
* `typing({ conversationId, receiverId })`: Emits typing status to the chat partner.
* `stopTyping({ conversationId, receiverId })`: Clears typing indicator.
* `messageRead({ messageId, senderId })`: Signals that the recipient viewed the message.

### Server ➔ Client
* `receiveMessage(message)`: Delivers real-time message object to the recipient.
* `userStatus({ userId, isOnline, lastSeen })`: Broadcasts presence changes.
* `userTyping({ conversationId, userId })`: Displays live typing indicator in active chat.
* `userStoppedTyping({ conversationId, userId })`: Hides typing indicator.
* `messageDelivered({ messageId })`: Updates single-tick status to double-tick.
* `messageRead({ messageId })`: Updates double-tick to blue/read receipt.

---

## 🔒 Security & Authentication Hardening

1. **Anti-Spam & Disposable Email Gate**: Domain checks prohibit burner addresses (`sharklasers`, `guerrillamail`, etc.).
2. **Dynamic Origin Resolution**: Forgot password tokens resolve `req.headers.origin` and `req.headers.referer` to prevent port mismatch vulnerabilities during deployment.
3. **Cryptographic One-Way Hashes**:
   - Passwords salted with `bcrypt` (10 rounds).
   - OTP codes and Password Reset Tokens stored as `crypto.createHash('sha256')` digests to protect against database leak exploits.
4. **Token Expiration Guards**:
   - OTP codes expire strictly in 10 minutes.
   - Password reset links expire strictly in 15 minutes.
   - JWT tokens expire in 7 days.
5. **No Secret Leaks**: Strict `.gitignore` policy ensures `.env` files are never exposed in source control.

---

## 📱 Progressive Web App (PWA) Capabilities

* **Web App Manifest**: Standard-compliant `manifest.webmanifest` configured with app icons (`192x192`, `512x512`), theme colors, and `standalone` display mode.
* **Service Worker**: Pre-caches HTML, CSS, JavaScript, and static assets via Workbox for near-instant boot times even on slow 3G networks.
* **Add to Home Screen**: Fully compatible with Safari iOS "Add to Home Screen" and Chrome / Edge native install prompts.

---

## 💻 Local Development Setup

### 1. Prerequisites
* Node.js v18+
* MongoDB Atlas connection string or local MongoDB instance
* Gmail Account with an [App Password](https://myaccount.google.com/apppasswords)

### 2. Clone Repository
```bash
git clone https://github.com/cyrilchris-j/fsd.RealTimeChat-MiniProject.git
cd fsd.RealTimeChat-MiniProject
```

### 3. Backend Configuration
```bash
cd server
npm install
```
Create `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/realtime-chat
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173

# Email Service (Nodemailer Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_letter_app_password
EMAIL_FROM="ChatApp <your_email@gmail.com>"

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Frontend Configuration
```bash
cd ../client
npm install
```
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 5. Running the Application
**Terminal 1 (Backend)**:
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push project to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Root Directory: `client`
4. Environment Variables:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
   - `VITE_SOCKET_URL=https://your-backend-service.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com`

### Backend (Render / Railway)
1. Create a **Web Service** pointing to the repository.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables from `server/.env`.

---

## 💼 Engineering Highlights & ATS Keywords

* **Architectural Patterns**: Model-View-Controller (MVC), RESTful Architecture, WebSocket Event-Driven System, Single Page Application (SPA), Progressive Web App (PWA).
* **Technical Skills**: Full-Stack Development, React Hooks (`useCallback`, `useContext`, `useEffect`), State Management, Node.js Concurrency, WebSocket Optimization, MongoDB Indexing, Mongoose Aggregation, Cryptographic Token Generation, Nodemailer Transactional Mail, OAuth 2.0 Authentication.
* **Security Practices**: OWASP Top 10 Awareness, Input Sanitization, Cryptographic Hashing, Stateless JWT Sessions, CORS Origin Whitelisting, Disposable Email Detection.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it for learning, portfolios, or commercial projects.
