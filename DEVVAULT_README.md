# ⚡ DevVault AI — AI-Powered Code Snippet & Bug Tracker

DevVault AI is a full-stack MERN application crafted with a sleek, dark-mode developer UI, powered by **Tailwind CSS**, **React + Vite**, **Node.js + Express**, **MongoDB/Mongoose**, and **Groq AI (Llama 3.3 70B Versatile)**.

---

## 🚀 Key Features

- **Developer-Centric Dark UI**: Tailored with Tailwind CSS, custom JetBrains Mono code blocks, subtle neon accents, and smooth glassmorphism.
- **Debounced Live Search**: Custom 300ms `useDebounce` hook to search title, code, language, and tags with zero input lag.
- **Category & Language Filtering**: Instant filtering by category (`All`, `Snippet`, `Bug Fix`) and language chips (`JavaScript`, `React`, `TypeScript`, `Python`, `CSS`, etc.).
- **Interactive Code Cards**:
  - Truncated monospace code preview with line numbers and expand/collapse.
  - One-click copy-to-clipboard with instant "Copied!" feedback.
  - Pin-to-top toggle (pins remain sticky at top).
  - Edit and Delete with safe confirmation modals.
- **AI-Powered Code & Bug Analysis (Groq Llama-3.3-70B)**:
  - Strict structured JSON outputs containing:
    - **Summary**: 1-2 sentence core function explanation.
    - **Bug Check**: Deep check for race conditions, memory leaks, unhandled exceptions, and edge cases.
    - **Complexity**: Time & Space Complexity notation (e.g. `O(1)`, `O(N)`).
  - Inline AI analysis inside the Add/Edit modal as well as dedicated slide-out drawer panel.
- **Resilient MongoDB Layer**: Connects to MongoDB Atlas or local MongoDB; includes an intelligent in-memory fallback so the app works immediately out of the box even before local MongoDB is started.
- **Pre-populated Seeds**: 3 realistic JavaScript/React seed entries pre-loaded on boot.

---

## 📁 Project Architecture

```
├── /server                         # Node.js + Express + Mongoose Backend
│   ├── /models
│   │   └── Snippet.js              # Mongoose Schema (title, code, language, category, tags, aiInsights, isPinned)
│   ├── /routes
│   │   ├── snippetRoutes.js        # REST CRUD endpoints (/api/snippets)
│   │   └── analyzeRoutes.js        # Groq Llama-3.3-70B AI endpoint (/api/analyze)
│   ├── /services
│   │   └── snippetStorage.js       # Resilient storage layer (MongoDB + Memory fallback)
│   ├── /seeds
│   │   └── seedData.js             # 3 pre-populated realistic JS/React seed entries
│   ├── server.js                   # Express Server entrypoint (Port 5000)
│   ├── .env                        # Server configuration
│   ├── .env.example
│   └── package.json
│
├── /client                         # React + Vite + Tailwind CSS Frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── Navbar.jsx          # Branding, 300ms debounced search, "+ New Entry" button
│   │   │   ├── FilterBar.jsx       # Category tabs (Snippet / Bug Fix) & language tag pills
│   │   │   ├── SnippetCard.jsx     # Card preview, copy, pin toggle, edit/delete, AI triggers
│   │   │   ├── SnippetModal.jsx    # Add/Edit modal with Tab-indenting code editor & live AI analyze
│   │   │   ├── AiInsightsPanel.jsx # Slide-out drawer with Summary, Bug Check, Complexity
│   │   │   ├── DeleteModal.jsx     # Safe deletion confirmation dialog
│   │   │   └── Toast.jsx           # Clean action feedback notifications
│   │   ├── /hooks
│   │   │   └── useDebounce.js      # 300ms debounced input hook
│   │   ├── /services
│   │   │   └── api.js              # Centralized REST & AI API client
│   │   ├── /utils
│   │   │   └── constants.js        # Language colors, categories, badge styles
│   │   ├── App.jsx                 # Main application controller
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind CSS directives & custom dark scrollbars
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js              # Vite server with /api proxy to port 5000
│   └── package.json
```

---

## 🛠️ Quick Start Guide

### 1. Start the Backend (`/server`)

```bash
cd server
npm start
```
*The backend starts at `http://localhost:5000`.*
*(If MongoDB is running, it connects automatically; otherwise, it starts in resilient demo mode with 3 seed entries.)*

To enable the live Groq API, add your key to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/devvault
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

### 2. Start the Frontend (`/client`)

In a new terminal:
```bash
cd client
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/snippets` | Retrieve snippets sorted by `isPinned: desc, createdAt: desc` |
| `POST` | `/api/snippets` | Create a new code snippet or bug fix |
| `GET` | `/api/snippets/:id` | Get single snippet by ID |
| `PUT` | `/api/snippets/:id` | Update snippet details |
| `PATCH` | `/api/snippets/:id/pin` | Toggle pin status |
| `DELETE` | `/api/snippets/:id` | Delete snippet by ID |
| `POST` | `/api/analyze` | Run Groq AI (Llama 3.3 70B) analysis `{ summary, bugCheck, complexity }` |
| `GET` | `/api/health` | Check backend server & database status |
