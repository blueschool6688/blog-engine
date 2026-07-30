# Blog Engine

A modern, full-stack Blog Engine built for performance, scalability, and AI integration. Powered by Golang (Fiber) on the backend and React (TypeScript) on the frontend.

## 🚀 Key Features

### 🤖 AI Agent & Integrations (NVIDIA AI)
The core of this system integrates heavily with NVIDIA's AI endpoints to provide an intelligent experience:
- **Retrieval-Augmented Generation (RAG) & Chatbot**: Uses `meta/llama-3.3-70b-instruct` to interact with users. It reads the blog's content, breaks it into chunks, creates vector embeddings via `nvidia/nemotron-3-embed-1b`, and stores them in PostgreSQL using the `pgvector` extension. When users ask a question, the agent retrieves the most relevant context to generate accurate answers.
- **Smart Semantic Search**: Thanks to `pgvector`, users can search by meaning, not just keywords. (System also provides a fallback keyword search if vector search is unavailable).
- **Spam Moderation**: Uses a lightweight model (`meta/llama-3.1-8b-instruct`) to automatically analyze comments and feedback for spam, drastically reducing manual moderation time.
- **Auto-Translation Agent**: An automated background agent uses AI to translate entire blog posts into different languages reliably, chunking content to ensure context is maintained.

### 📝 Content Management
- **Rich Text Editor**: Powerful and intuitive editor for crafting engaging blog posts.
- **Media & Gallery Library**: Centralized asset management. Background workers automatically handle image processing, resizing, and video handling.
- **Categories & Tags**: Flexible taxonomy system to perfectly organize your posts.
- **Scheduled Publishing**: Set a time for your posts to go live automatically via dedicated background publish workers.
- **Multi-language Support**: Context-driven language switching and content localization.

### 💬 Community & Engagement
- **Comment System**: Robust comment engine featuring moderation workflows, nested replies, and user reactions.
- **Feedback Collection**: Gather, manage, and respond to feedback directly from your readers.
- **Discord Integration**: Sends important alerts (new comments, feedback, etc.) directly to your Discord server via a configured bot.

### 🛡️ Admin & Security
- **Role-Based Access Control (RBAC)**: Secure admin dashboard protected by JWT and role middlewares.
- **Audit Logs**: Comprehensive tracking of all actions performed by admins and users within the system.
- **Authentication**: Secure JWT-based authentication system with refresh token flows, bcrypt hashing, and password reset capabilities.

### ⚡ Performance & Scalability
- **Memcached Integration**: Ultra-fast caching layer for posts, search results, and lists to handle high traffic effortlessly.
- **Cloudflare Cache Purging**: Automatically purges CDN edge cache via API whenever content is updated.
- **Background Workers**: Asynchronous processing for media uploads, scheduled publishing, and translations to keep the main API lightning fast.

## 🛠️ Technology Stack

**Backend (Golang):**
- **Core**: Go 1.21+, Fiber (Web framework)
- **Database**: PostgreSQL with `pgvector` extension
- **ORM**: GORM
- **Caching**: Memcached (`bradfitz/gomemcache`)
- **Security**: JWT (`golang-jwt/jwt/v5`), bcrypt (`golang.org/x/crypto/bcrypt`)
- **AI/LLM**: NVIDIA AI Endpoints SDK
- **Integrations**: Cloudflare API, Discord Bot, SMTP Mailer

**Frontend (React):**
- **Core**: React 18, TypeScript, Vite
- **State/Routing**: Context API (Auth, Theme, Toast, Language), React Router
- **Styling**: Tailwind CSS / Vanilla CSS (Responsive Modern UI)

## 📦 Project Structure

- `/backend`: Go source code, REST APIs, database models, repository layers, and background workers.
- `/web`: React frontend source code, reusable components, custom hooks, contexts, and pages.

## ⚙️ Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL (with `pgvector` extension recommended for semantic search)
- Memcached

### Environment Variables
Configure your environment by setting up the `.env` file in the root directory:
```env
PORT=8080
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=blogs
MEMCACHED_ADDR=127.0.0.1:11211
UPLOADS_DIR=./uploads

# Security
JWT_SECRET=your_jwt_secret

# AI Models (NVIDIA)
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_SPAM_MODEL=meta/llama-3.1-8b-instruct
NVIDIA_CHAT_MODEL=meta/llama-3.3-70b-instruct
NVIDIA_EMBED_MODEL=nvidia/nemotron-3-embed-1b

# Integrations
CF_ZONE_ID=
CF_API_TOKEN=
DISCORD_PUBLIC_KEY=
DISCORD_BOT_SECRET=
DISCORD_AUTHOR_ID=
```

### Running the Application

1. **Start the Backend:**
   ```bash
   cd backend
   go run cmd/migrate/main.go  # Run database migrations
   go run bootstrap/app.go     # Start the API server
   ```

2. **Start the Frontend:**
   ```bash
   cd web
   npm install
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.
