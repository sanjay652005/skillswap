# SkillSwap 🔄

> An AI-powered peer-to-peer skill exchange platform where users teach what they know and learn what they don't — with real-time chat, session scheduling, and a Trust & Reputation system.

![Live](https://img.shields.io/badge/Live-000000?style=for-the-badge&logo=vercel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

🌐 **Live Demo** → [skillswap-six-pi.vercel.app](https://skillswap-six-pi.vercel.app/)

---

## 🚀 Features

- 🤖 **AI-powered user matching** — Groq API + Llama 3.1 matches users based on skills offered and wanted
- 💬 **Real-time chat** — instant messaging via Socket.IO
- 📅 **Session scheduling** — book and manage skill exchange sessions
- ✅ **Kanban task board** — track learning progress with drag-and-drop tasks
- ⭐ **Trust & Reputation Score** — builds credibility through completed sessions and reviews
- 🔐 **JWT Authentication** — secure login and protected routes
- 📱 **Responsive UI** — works seamlessly across all devices

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Socket.io Client |
| Backend | Node.js, Express.js, MongoDB Atlas |
| AI Matching | Groq API, Llama 3.1 |
| Real-time | Socket.IO |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 📂 Project Structure

```
skillswap/
├── frontend/          # React.js + Tailwind CSS
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API & Socket services
└── backend/           # Node.js + Express
    ├── controllers/       # Route controllers
    ├── models/            # MongoDB schemas
    ├── routes/            # API routes
    ├── middleware/        # Auth & error middleware
    └── socket/            # Socket.IO handlers
```

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sanjay652005/skillswap.git
cd skillswap
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Create `.env` in `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

### 4. Run the project

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

---

## 🎯 Core Modules

### AI Matching Engine
Users list skills they can teach and skills they want to learn. The Groq API + Llama 3.1 analyzes profiles and suggests the most compatible skill exchange partners.

### Real-time Chat
Built with Socket.IO, users can message matched partners instantly with live read receipts and typing indicators.

### Kanban Task Board
Each skill exchange session comes with a personal Kanban board to track tasks — To Do, In Progress, Done.

### Trust & Reputation Score
Every completed session and review contributes to a user's Trust Score, encouraging quality exchanges and accountability.

---

## 🔮 Future Enhancements

- [ ] WebRTC video/audio calling for live sessions
- [ ] Group skill exchange sessions
- [ ] Skill endorsements
- [ ] Mobile app (React Native)
- [ ] Payment integration for premium sessions

---

## 👨‍💻 Author

**Sanjay P** — Full Stack Developer (MERN)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/sanjayp-dev)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/sanjay652005)

---

⭐ If you found this project useful, give it a star — it means a lot!
