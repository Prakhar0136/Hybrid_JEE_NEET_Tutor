# 🎓 Hybrid JEE/NEET AI Tutor

[![CI Pipeline](https://github.com/Prakhar0136/Hybrid_JEE_NEET_Tutor/actions/workflows/ci.yml/badge.svg)](https://github.com/Prakhar0136/Hybrid_JEE_NEET_Tutor/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-black.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Cloud-f55036?style=flat-square)](https://groq.com/)
[![Langfuse](https://img.shields.io/badge/Observability-Langfuse-000000?style=flat-square)](https://langfuse.com/)

> An AI-powered preparation platform engineered specifically for **JEE & NEET aspirants**. Features NCERT-grounded question answering via semantic retrieval, timed mock test generation, adaptive weakness diagnostics, automated personalized 3-day study schedules, interactive flashcard revision, and full end-to-end LLM observability with a high-contrast Neo-Brutalist UI.

---

## ⚡ Key Capabilities

- **💬 AI Doubt Solver & RAG Assistant**: Ask complex Physics, Chemistry, and Mathematics problems with LaTeX equation formatting (`KaTeX`) and citation sourcing.
- **📝 Timed Mock Test Engine**: Live 5-minute timed question evaluation engine with question topic tagging, option selection tracking, instant scoring, and weak-area extraction.
- **📊 Analytics & Performance Insights**: Automated visual progress tracking (recharts trend graph, accuracy scores, and highlighted topics requiring immediate remediation).
- **🚀 AI-Driven 3-Day Study Plan**: Dynamically generates tailored markdown revision roadmaps powered by ultra-fast LLM inference based on your test history and identified weak areas.
- **📚 Targeted Flashcards**: Interactive 3D flip-card revision system generating 5 high-yield conceptual flashcards addressing your specific mistakes.
- **🔍 Full LLM Observability & Tracing**: Production tracing, token usage tracking, and latency profiling using **Langfuse** & **OpenTelemetry**.
- **🎨 Neo-Brutalist Design**: High-contrast, minimal, and modern interface styled with Tailwind CSS, brutalist typography, and hard drop-shadows.

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4, custom Neo-Brutalist styling
- **Math & Markdown**: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`
- **Charts & Data Viz**: `recharts`
- **Client & State**: Axios, `js-cookie`, React Hook Form, Zod

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Authentication**: JWT (`jsonwebtoken`) & password hashing with `bcryptjs`
- **LLM Inference**: Groq SDK (`openai/gpt-oss-120b`)
- **Tracing & Observability**: `@langfuse/otel`, `@langfuse/tracing`, `@opentelemetry/sdk-node`
- **Retrieval & Documents**: FAISS (`faiss-node`), LangChain (`@langchain/community`, `@langchain/core`), PDF parsing (`pdf-parse`)

---

## 📁 Repository Structure

```text
├── .github/workflows/
│   └── ci.yml               # GitHub Actions CI pipeline (Node.js syntax & Next.js typecheck/build)
├── backend/
│   ├── config/              # MongoDB & Langfuse OpenTelemetry setup
│   ├── controllers/         # AI, Test, Chat, and Auth controllers
│   ├── middleware/          # JWT authentication middleware
│   ├── models/              # User, ChatSession, Question, TestSubmission schemas
│   ├── routes/              # Express API route endpoints
│   ├── data/                # Reference PDF material for RAG ingestion
│   └── server.js            # Express server entry point & CORS configuration
├── frontend/
│   ├── app/
│   │   ├── (auth)/          # Login & Signup authentication routes
│   │   ├── chat/            # AI Tutor chat interface with markdown & LaTeX
│   │   ├── components/      # Reusable Brutalist Navbar & UI elements
│   │   ├── config/          # Centralized API base configuration
│   │   ├── dashboard/       # Analytics dashboard & AI Study Plan generator
│   │   ├── flashcards/      # Interactive 3D flip flashcard revision deck
│   │   ├── test/            # Timed mock test runner & question engine
│   │   └── globals.css      # Base brutalist styles & 3D card rotation utilities
│   ├── package.json
│   └── next.config.ts
└── README.md
```

---

## 🚀 Getting Started Locally

### **Prerequisites**
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MongoDB**: A running local instance or MongoDB Atlas URI
- **Groq API Key**: Free API key from [Groq Console](https://console.groq.com/)
- **Langfuse Keys** *(Optional but recommended)*: Free project keys from [Langfuse Cloud](https://cloud.langfuse.com/)

---

### **1. Clone the Repository**
```bash
git clone https://github.com/Prakhar0136/Hybrid_JEE_NEET_Tutor.git
cd Hybrid_JEE_NEET_Tutor
```

---

### **2. Backend Setup**

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/jee_neet_tutor?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-120b
   FRONTEND_URL=http://localhost:3000
   LANGFUSE_PUBLIC_KEY=pk-lf-your_public_key
   LANGFUSE_SECRET_KEY=sk-lf-your_secret_key
   LANGFUSE_HOST=https://cloud.langfuse.com
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend will run on [http://localhost:5000](http://localhost:5000).*

---

### **3. Frontend Setup**

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Frontend will be accessible at [http://localhost:3000](http://localhost:3000).*

---

## 🌐 Production Deployment

### **Backend on [Render](https://render.com/)**
1. Create a new **Web Service** pointing to this repo.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add the production environment variables specified in [`backend/.env.production.example`](backend/.env.production.example).
4. Render provides a live health check endpoint: `GET /health`.

### **Frontend on [Vercel](https://vercel.com/)**
1. Create a new project and import this repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your live Render backend URL (e.g., `https://jee-neet-tutor-api.onrender.com`).
4. Click **Deploy**.
5. Once your Vercel URL is live, update the `FRONTEND_URL` variable in Render to your Vercel domain.

---

## 🧪 Continuous Integration

This repository includes a GitHub Actions CI workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that automatically runs on every push and pull request:
- **Backend check**: Dependency integrity (`npm ci`) and syntax verification (`node -c server.js`).
- **Frontend check**: Dependency integrity (`npm ci`), TypeScript typechecking (`npx tsc --noEmit`), and production Next.js build (`npm run build`).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
