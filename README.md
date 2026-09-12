# Real-Time Chat Application

A full-stack real-time chat application that allows users to communicate instantly through one-to-one messaging. The application uses Socket.IO for real-time communication and MongoDB for persistent message storage.

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- One-to-one real-time messaging
- Instant message delivery using Socket.IO
- Persistent chat history using MongoDB
- Online/offline user status
- Last seen status
- Typing indicator
- Message sent, delivered, and read status
- User search
- Responsive chat interface
- Protected routes
- Loading and error states
- Mobile-friendly UI

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Axios
- React Router
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT
- bcrypt
- Mongoose
- CORS
- dotenv

### Database
- MongoDB
- MongoDB Atlas

## Architecture

```text
                    REAL-TIME CHAT APPLICATION

                         React Frontend
                              |
                    +---------+---------+
                    |                   |
                 REST API          Socket.IO
                    |                   |
                    +---------+---------+
                              |
                       Node.js Server
                              |
                +-------------+-------------+
                |                           |
          Authentication              Chat Server
                |                           |
                +-------------+-------------+
                              |
                           MongoDB
                              |
                    Persistent Storage
````

## Real-Time Message Flow

```text
User A
   |
   | Send Message
   v
Socket.IO Client
   |
   v
Node.js + Socket.IO Server
   |
   +------> MongoDB
   |           |
   |           +---- Save Message
   |
   v
Socket.IO
   |
   v
User B
   |
   +---- Message appears instantly
```

Socket.IO handles real-time communication, while MongoDB stores users, conversations, and messages permanently.

## Project Structure

```text
real-time-chat/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UserList.jsx
│   │   │   ├── UserListItem.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── OnlineStatus.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Chat.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── server/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── conversationController.js
│   │   └── messageController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── conversationRoutes.js
│   │   └── messageRoutes.js
│   │
│   ├── socket/
│   │   └── chatSocket.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── README.md
└── package.json
```

## Database Design

### User

```text
User
├── name
├── username
├── email
├── password
├── avatar
├── isOnline
├── lastSeen
├── createdAt
└── updatedAt
```

### Conversation

```text
Conversation
├── participants
├── lastMessage
├── lastMessageAt
├── createdAt
└── updatedAt
```

### Message

```text
Message
├── sender
├── receiver
├── conversationId
├── text
├── status
├── createdAt
└── updatedAt
```

## Message Status

```text
sent       → Message has been sent
delivered  → Message has reached the receiver
read       → Receiver has opened/read the message
```

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

```text
GET /api/users
GET /api/users/:id
GET /api/users/search?q=
```

### Conversations

```text
GET  /api/conversations
POST /api/conversations
GET  /api/conversations/:id
```

### Messages

```text
GET   /api/messages/:conversationId
POST  /api/messages
PATCH /api/messages/:id/read
```

## Socket.IO Events

### Client → Server

```text
userOnline
sendMessage
typing
stopTyping
messageRead
```

### Server → Client

```text
receiveMessage
userStatus
userTyping
userStoppedTyping
messageDelivered
messageRead
```

## Prerequisites

Install the following:

* Node.js
* npm
* MongoDB Atlas account
* Git

Check Node.js:

```bash
node -v
```

Check npm:

```bash
npm -v
```

## MongoDB Setup

1. Create a MongoDB Atlas account.
2. Create a new cluster.
3. Create a database user.
4. Configure Network Access.
5. Select Connect → Drivers.
6. Copy the MongoDB connection string.
7. Add the connection string to `server/.env`.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/realtime-chat
```

Never commit the MongoDB connection string to GitHub.

## Environment Variables

Create:

```text
server/.env
```

Add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Replace the placeholder values with your own configuration.

## Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd real-time-chat
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Run the Backend

Open a terminal:

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

## Run the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

## Testing Real-Time Chat

### 1. Create User A

Register a user such as:

```text
Name: Alice
Username: alice
Email: alice@example.com
Password: ********
```

### 2. Create User B

Register another user:

```text
Name: Bob
Username: bob
Email: bob@example.com
Password: ********
```

### 3. Login User A

Login as Alice in the first browser.

### 4. Login User B

Open another browser or Incognito window and login as Bob.

### 5. Send a Message

Alice selects Bob and sends:

```text
Hello Bob!
```

Bob should receive:

```text
Hello Bob!
```

immediately without refreshing the browser.

### 6. Test Typing Indicator

When Alice types a message, Bob should see:

```text
Alice is typing...
```

### 7. Test Online/Offline Status

Close Bob's browser.

Alice should see Bob as:

```text
Offline
```

### 8. Test Message Persistence

Send a message while Bob is offline.

Login as Bob again.

The previous message should still be available because it was stored in MongoDB.

## Security

The application follows basic security practices:

* Passwords are hashed using bcrypt.
* JWT is used for authentication.
* Protected API routes require authentication.
* Socket.IO connections are authenticated.
* MongoDB credentials are stored in environment variables.
* `.env` files are excluded from Git.
* Users can only access conversations they belong to.
* Sensitive user information is not exposed through APIs.
* User input is validated before processing.

## Git Setup

Initialize Git:

```bash
git init
```

Check status:

```bash
git status
```

Add files:

```bash
git add .
```

Create commit:

```bash
git commit -m "Initial chat application"
```

Add GitHub repository:

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
```

Rename branch:

```bash
git branch -M main
```

Push to GitHub:

```bash
git push -u origin main
```

## .gitignore

The project must include:

```text
node_modules/
.env
.env.local
dist/
build/
*.log
```

Never commit:

```text
.env
```

to GitHub.

## Future Enhancements

* Group chat
* Image and file sharing
* Voice messages
* Video calling
* Emoji picker
* Message reactions
* Message editing
* Message deletion
* Push notifications
* End-to-end encryption
* Message search
* User profile customization
* Dark mode
* Chat notifications

## Project Outcome

This project demonstrates full-stack web development using:

```text
React
  +
Node.js
  +
Express.js
  +
Socket.IO
  +
MongoDB
  +
Mongoose
  +
JWT
```

The application demonstrates:

* Frontend development
* Backend development
* REST API development
* Authentication
* Database management
* WebSocket communication
* Real-time data synchronization

## Key Concept

```text
MongoDB
   ↓
Permanent Storage

Socket.IO
   ↓
Real-Time Communication

Node.js + Express
   ↓
Backend Logic

React
   ↓
User Interface
```

MongoDB stores the conversation permanently.

Socket.IO delivers new messages instantly.

Therefore:

```text
User A
   ↓
Send Message
   ↓
Socket.IO
   ↓
Node.js Server
   ↓
MongoDB
   ↓
Save Message
   ↓
Socket.IO
   ↓
User B
   ↓
Message appears instantly
```

## Conclusion

The Real-Time Chat Application provides an efficient platform for instant communication between users. It combines React, Node.js, Express, Socket.IO, MongoDB, and JWT authentication to create a complete full-stack real-time messaging system.

The primary objective of the project is to demonstrate real-time bidirectional communication where users can send and receive messages instantly without refreshing the application.

```
```
