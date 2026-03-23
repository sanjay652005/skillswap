# SkillExchange — AI-Powered Developer Collaboration Platform

A full-stack MERN application for developers to exchange skills, collaborate on projects, chat in real-time, and get AI-powered coding help.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional, for AI features)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Configure Environment

```bash
# In the server/ directory, copy and edit .env
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillexchange
JWT_SECRET=your_super_secret_key_here_min_32_chars
OPENAI_API_KEY=sk-...your-openai-key...
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# If using local MongoDB:
mongod
```

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Backend runs at `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```
Frontend runs at `http://localhost:3000`

---

## 🗂️ Project Structure

```
skillexchange/
├── server/
│   ├── index.js              # Entry point, Express + Socket.io setup
│   ├── .env.example          # Environment template
│   ├── models/
│   │   ├── User.js           # User schema with auth methods
│   │   ├── ExchangeRequest.js
│   │   ├── ExchangeWorkspace.js
│   │   ├── Project.js
│   │   ├── ProjectWorkspace.js
│   │   ├── Message.js        # Chat messages
│   │   ├── Task.js           # Kanban tasks
│   │   ├── Review.js         # Rating & feedback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── exchangesController.js
│   │   ├── projectsController.js
│   │   ├── messagesController.js
│   │   ├── tasksController.js
│   │   ├── reviewsController.js
│   │   └── aiController.js   # OpenAI integration
│   ├── routes/               # Express route definitions
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   └── socket/
│       └── socketHandler.js  # Socket.io event handlers
│
└── client/
    └── src/
        ├── App.js            # Router setup
        ├── index.css         # Tailwind + custom styles
        ├── context/
        │   └── AuthContext.js # Auth state management
        ├── utils/
        │   ├── api.js        # Axios instance with interceptors
        │   └── socket.js     # Socket.io client manager
        ├── components/
        │   ├── Layout.js     # Sidebar navigation
        │   ├── ChatPanel.js  # Real-time chat component
        │   └── TaskManager.js # Kanban board component
        └── pages/
            ├── Login.js
            ├── Register.js   # Multi-step registration
            ├── Dashboard.js  # Main dashboard
            ├── Explore.js    # Find developers
            ├── Exchanges.js  # Manage exchanges
            ├── ExchangeWorkspace.js  # Chat + tasks + resources
            ├── Projects.js   # Project listing + creation
            ├── ProjectWorkspace.js  # Monaco editor + chat + tasks
            ├── AIChatbot.js  # GPT-powered AI assistant
            └── Profile.js    # User profile + reviews
```

---

## 📡 API Reference (Postman Examples)

### Authentication

**Register:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Alice Dev",
  "email": "alice@example.com",
  "password": "password123",
  "bio": "Full-stack developer with 5 years experience",
  "skillsOffered": ["React", "Node.js", "TypeScript"],
  "skillsWanted": ["Machine Learning", "Go"],
  "availability": "evenings",
  "githubLink": "https://github.com/alicedev"
}

Response: { token: "jwt_token_here", user: {...} }
```

**Login:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{ "email": "alice@example.com", "password": "password123" }
```

**Get Current User:**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>
```

---

### Users

**Get All Users (with filters):**
```http
GET http://localhost:5000/api/users?search=React&availability=evenings
Authorization: Bearer <token>
```

**Get Skill-Match Suggestions:**
```http
GET http://localhost:5000/api/users/suggestions
Authorization: Bearer <token>
```

**Get Online Users:**
```http
GET http://localhost:5000/api/users/online
Authorization: Bearer <token>
```

**Update Profile:**
```http
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "skillsOffered": ["React", "Vue.js"],
  "skillsWanted": ["Python", "AWS"]
}
```

---

### Skill Exchanges

**Send Exchange Request:**
```http
POST http://localhost:5000/api/exchanges
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user_id_here",
  "skillOffered": "React",
  "skillWanted": "Machine Learning",
  "message": "Hi! I'd love to exchange skills with you."
}
```

**Get My Exchanges:**
```http
GET http://localhost:5000/api/exchanges
Authorization: Bearer <token>
```

**Accept/Decline Request:**
```http
PUT http://localhost:5000/api/exchanges/:exchangeId/respond
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "accepted" }   // or "declined"
```

**Get Exchange Workspace:**
```http
GET http://localhost:5000/api/exchanges/workspace/:workspaceId
Authorization: Bearer <token>
```

**Add Resource to Workspace:**
```http
POST http://localhost:5000/api/exchanges/workspace/:workspaceId/resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "React Hooks Guide",
  "url": "https://reactjs.org/docs/hooks-intro.html",
  "type": "link"
}
```

---

### Projects

**Create Project:**
```http
POST http://localhost:5000/api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI Chat App",
  "description": "A real-time chat application with AI features",
  "techStack": ["React", "Node.js", "Socket.io", "OpenAI"],
  "skillsNeeded": ["Backend", "ML"],
  "githubRepo": "https://github.com/example/ai-chat",
  "isPublic": true
}
```

**Get All Projects:**
```http
GET http://localhost:5000/api/projects?tech=React&status=open
Authorization: Bearer <token>
```

**Get My Projects:**
```http
GET http://localhost:5000/api/projects/my
Authorization: Bearer <token>
```

**Invite Collaborator:**
```http
POST http://localhost:5000/api/projects/:projectId/invite
Authorization: Bearer <token>
Content-Type: application/json

{ "userId": "collaborator_user_id" }
```

---

### Tasks

**Create Task:**
```http
POST http://localhost:5000/api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to the API",
  "workspaceId": "workspace_id_here",
  "workspaceType": "project",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

**Update Task Status:**
```http
PUT http://localhost:5000/api/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "in-progress" }
```

---

### Messages

**Get Chat History:**
```http
GET http://localhost:5000/api/messages/exchange/:roomId
Authorization: Bearer <token>
```

---

### Reviews

**Create Review:**
```http
POST http://localhost:5000/api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "revieweeId": "user_id_being_reviewed",
  "referenceId": "exchange_or_project_id",
  "referenceType": "exchange",
  "rating": 5,
  "feedback": "Excellent React teacher! Very patient and knowledgeable.",
  "skillReviewed": "React"
}
```

**Get User Reviews:**
```http
GET http://localhost:5000/api/reviews/user/:userId
Authorization: Bearer <token>
```

---

### AI Assistant

**Chat with AI:**
```http
POST http://localhost:5000/api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Explain React useCallback hook" }
  ],
  "context": "Developer learning React"
}
```

**Get AI Suggestions:**
```http
GET http://localhost:5000/api/ai/suggestions
Authorization: Bearer <token>
```

---

## 🔌 WebSocket Events

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

### Chat Events

**Join a room:**
```javascript
socket.emit('join_room', 'workspace_id_here');
```

**Send a message:**
```javascript
socket.emit('send_message', {
  content: 'Hello everyone!',
  roomId: 'workspace_id',
  roomType: 'exchange',  // or 'project'
  messageType: 'text'    // or 'code'
});
```

**Receive messages:**
```javascript
socket.on('new_message', (message) => {
  console.log(message);
  // { sender: {...}, content: '...', roomId: '...', createdAt: ... }
});
```

**Typing indicators:**
```javascript
// Emit when typing
socket.emit('typing_start', { roomId: 'workspace_id' });
socket.emit('typing_stop', { roomId: 'workspace_id' });

// Listen for others typing
socket.on('user_typing', ({ userId, name, roomId }) => {
  console.log(`${name} is typing...`);
});
socket.on('user_stop_typing', ({ userId, roomId }) => {
  console.log('User stopped typing');
});
```

### Live Code Collaboration Events

**Join code session:**
```javascript
socket.emit('join_code_session', 'workspace_id');
```

**Broadcast code changes:**
```javascript
socket.emit('code_change', {
  workspaceId: 'workspace_id',
  content: '// Updated code here',
  language: 'javascript'
});
```

**Receive code updates:**
```javascript
socket.on('code_updated', ({ content, language, editedBy }) => {
  console.log(`${editedBy.name} updated the code`);
  editor.setValue(content);
});
```

### Online Status Events

```javascript
socket.on('user_online', ({ userId, name }) => {
  console.log(`${name} came online`);
});

socket.on('user_offline', ({ userId }) => {
  console.log('User went offline');
});
```

---

## ✅ End-to-End Testing Flow

### Test 1: Complete Skill Exchange Flow

1. Register two users (Alice: offers React, wants ML; Bob: offers ML, wants React)
2. Alice searches for Bob in Explore → sends exchange request
3. Bob goes to Exchanges → accepts the request
4. Both open the Exchange Workspace
5. Test real-time chat by sending messages from both tabs
6. Add tasks to the workspace kanban board
7. Share a resource (link or note)
8. Mark exchange as complete
9. Bob leaves a review for Alice

### Test 2: Project Collaboration Flow

1. Alice creates a project (AI Chat App, React + Node.js)
2. Alice invites Bob as collaborator
3. Bob responds to invite from Project page
4. Both open the Project Workspace
5. Test live code editor — changes should sync instantly
6. Use the kanban task board to track work
7. Test project chat

### Test 3: AI Assistant

1. Go to AI Assistant page
2. Click a quick prompt or type: "Explain React hooks"
3. Follow up with: "Show me an example with useCallback"
4. Ask for: "What's the best learning path for machine learning?"

### Test 4: Real-time Multi-user Chat

Open two browser windows (or use incognito) logged in as different users:
1. Both join the same workspace chat room
2. Messages should appear instantly in both windows
3. Type in one window — typing indicator should appear in the other
4. Test that message history persists on page refresh

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| State Management | React Context API |
| Real-time | Socket.io (client + server) |
| HTTP Client | Axios with JWT interceptors |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| AI | OpenAI GPT-3.5-turbo |
| Fonts | Syne (display), DM Sans (body), JetBrains Mono |

---

## 🐛 Troubleshooting

**MongoDB connection fails:**
- Ensure MongoDB is running: `mongod` or check MongoDB Atlas connection string

**Socket.io CORS error:**
- Ensure `CLIENT_URL` in .env matches your frontend URL exactly

**AI features not working:**
- The app has a graceful fallback if no OpenAI API key is set
- Add your API key to `server/.env` for full AI functionality

**Monaco Editor not loading:**
- It requires `@monaco-editor/react` package. Run `npm install` in client/

**Port already in use:**
- Change PORT in server/.env, update client proxy in package.json
