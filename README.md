# Blog Engine

A modern, full-stack Blog Engine built for performance, scalability, and AI integration. Powered by Golang (Fiber) on the backend and React (TypeScript) on the frontend.

## 🚀 Key Features

### 🤖 AI Agent & Integrations (NVIDIA AI)
The core of this system integrates heavily with NVIDIA's AI endpoints to provide an intelligent experience:
- **Retrieval-Augmented Generation (RAG) & Chatbot**: Uses `meta/llama-3.3-70b-instruct` to interact with users. It reads the blog's content, breaks it into chunks, creates vector embeddings via `nvidia/nemotron-3-embed-1b`, and stores them in PostgreSQL using the `pgvector` extension. When users ask a question, the agent retrieves the most relevant context to generate accurate answers.
- **Smart Semantic Search**: Thanks to `pgvector`, users can search by meaning, not just keywords. (System also provides a fallback keyword search if vector search is unavailable).
- **AI Content Generator**: An intelligent agent that helps draft and auto-generate complete, SEO-optimized blog posts based on brief prompts or outlines, drastically speeding up content creation.
- **Spam Moderation**: Uses a lightweight model (`meta/llama-3.1-8b-instruct`) to automatically analyze comments and feedback for spam, drastically reducing manual moderation time.
- **Auto-Translation Agent**: An automated background agent uses AI to translate entire blog posts into different languages reliably, chunking content to ensure context is maintained.
- **Document-to-Markdown Parser (MinerU / Dual-Engine)**: Allows admins to upload PDF/DOCX files (drafts, books, articles) to directly convert them into SEO-ready blog posts. 
  - *Advanced Mode*: Powered by MinerU (`magic-pdf`) for AI-driven layout analysis and complex table/formula extraction.
  - *Lightweight Mode*: Automatically falls back to a fast parser using `pymupdf` and `mammoth` (under 50MB RAM, instant startup, no heavy models required).
  - *Smart Table of Contents (TOC)*: Heuristically detects chapters and automatically converts the document's printed TOC into interactive anchor links for smooth scrolling on the client detail page.
  - *Automated Image Extraction & Cloud Linking*: Automatically extracts images, uploads them to the configured media storage provider (Local/S3), creates media database records, and rewrites markdown image links.

### 📝 Content Management
- **Rich Text Editor**: Powerful and intuitive editor for crafting engaging blog posts.
- **Media & Gallery Library (Cloud Storage)**: Centralized asset management with seamless media uploads to Amazon S3 (or any S3-compatible cloud storage). Background workers automatically handle image processing, resizing, and video handling before securely storing them in the cloud.
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
- **Integrations**: Cloudflare API, Discord Bot, SMTP Mailer, Amazon S3 (Cloud Storage)

**Frontend (React):**
- **Core**: React 18, TypeScript, Vite, Server-Side Rendering (SSR)
- **State/Routing**: Context API (Auth, Theme, Toast, Language), React Router v7 (Framework mode with SSR)
- **Styling**: Tailwind CSS / Vanilla CSS (Responsive Modern UI)

**Infrastructure & Deployment:**
- **Docker**: Containerized deployment for consistent environments (Build, Pull, Push, Deploy)

## 📦 Project Structure

- `/backend`: Go source code, REST APIs, database models, repository layers, and background workers.
- `/web`: React frontend source code, reusable components, custom hooks, contexts, and pages.
- `/mineru-service`: Python FastAPI microservice hosting the dual-engine document parser (MinerU & PyMuPDF/Mammoth).

## 🤖 Built by AI Agents

This entire blog engine (both frontend and backend) was generated, structured, and implemented by an advanced **AI Coding Agent**. The development process heavily utilized modern agentic methodologies:
- **Skill-based Code Generation**: The AI leveraged specialized skills (e.g., Golang project layout, concurrency, dependency management, React contexts) to write idiomatic, clean, and highly scalable code.
- **Structured Workflows**: Followed a systematic AI workflow (Planning -> Execution -> Verification) to ensure all features are robust, well-integrated, and complete.
- **Strict Agent Rules**: The codebase generation adhered to strictly defined rules and architectural constraints to guarantee consistency, security, and maintainability across the full stack.

## ⚙️ Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL (with `pgvector` extension recommended for semantic search)
- Memcached

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

3. **Start the Document Parser Service (Optional):**
   ```bash
   cd mineru-service
   # Highly recommended for quick local setup (uses <50MB RAM)
   ./start.sh --light
   # Or run without flags to install full deep-learning AI weights
   ./start.sh
   ```

## 🐳 Docker Deployment

The application is designed to be fully containerized, making it easy to build, push, pull, and deploy across any environment.

# Deploy services in the background
docker-compose up -d
```

## 📄 License
This project is licensed under the MIT License.
