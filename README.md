# 3 Boxes Jobs — AI-Powered Job Portal

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License" />
</p>

**3 Boxes Jobs** is India's first AI-powered career platform that transforms the job search and recruitment experience with smart resume building, automated skill updates, AI mock interviews, and intelligent job matching.

---

## 🚀 Key Features

### For Job Seekers
- 🤖 **AI Resume Builder** — Auto-generate and enhance resumes. Skills auto-update when training is completed.
- 🎯 **Smart Job Matching** — AI-powered job matching scores based on your skills, experience, and preferences.
- 🧠 **AI Mock Interviews** — Practice with AI-powered mock interviews. Get real-time feedback on communication and technical skills.
- ⚡ **Skill Auto-Update** — Complete training courses and your skills are automatically updated across your profile and resume.
- 🎓 **Training Hub** — Access curated courses to upskill. AI recommends courses based on career goals and market trends.
- 📊 **AI Analytics Dashboard** — Comprehensive analytics with AI-driven insights and career recommendations.

### For Corporates
- 📋 **Job Posting** — Create optimized job postings with AI assistance.
- 🔍 **AI Candidate Matching** — Get AI-scored candidate matches based on skills and requirements.
- 📈 **Application Management** — Track and manage applications through the hiring pipeline.
- 📊 **Analytics Dashboard** — View hiring metrics and performance data.

### For Recruiters
- 👥 **Candidate Search** — Source candidates based on skills, experience, and location.
- 🔄 **Pipeline Management** — Track candidates through sourcing, screening, interview, and offer stages.
- 📅 **Interview Scheduling** — Schedule and manage interviews with candidates.
- 📊 **Placement Analytics** — Track placement metrics and recruiter performance.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite (dev) |
| Auth | Custom JWT-based authentication |
| State Management | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Package Manager | Bun |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/pmkshar/3boxesjobportal.git
cd 3boxesjobportal

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Push database schema
bun run db:push

# Seed the database with demo data
# (Auto-seeds on first page load, or manually:)
curl -X POST http://localhost:3000/api/seed

# Start development server
bun run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | seeker@3boxes.com | demo123 |
| Corporate | corp@3boxes.com | demo123 |
| Recruiter | recruiter@3boxes.com | demo123 |
| Admin | admin@3boxes.com | demo123 |

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Capabilities |
|------|-------------|
| **JOB_SEEKER** | Search jobs, build resumes, take AI interviews, enroll in training, track analytics |
| **CORPORATE** | Post jobs, review applications, manage company profile, view hiring analytics |
| **RECRUITER** | Search candidates, manage pipeline, schedule interviews, track placements |
| **ADMIN** | Full system access with administrative capabilities |

---

## 🤖 AI Features Deep Dive

### Skill Auto-Update System
When a job seeker completes a training course:
1. Training completion triggers enrollment status → "completed"
2. Course skills are auto-added to `SkillAssessment` records
3. `JobSeekerProfile.skills` field is automatically updated
4. Active resumes receive AI update timestamp + skill refresh
5. `aiSkillScore` is recalculated based on updated skill profile
6. User receives a notification about the skill update

### AI Mock Interview
1. Generates role-specific questions based on job role, industry, and difficulty level
2. Provides timed question sessions with categories (General, Technical, Behavioral)
3. Scores responses across Communication, Technical, and Confidence dimensions
4. Delivers detailed AI feedback with improvement suggestions
5. Updates skill assessments based on interview performance

### AI Analytics
- Application status distribution (pie chart)
- Skill assessment levels (bar chart)
- Recent activity trends (line chart)
- Interview score trends (multi-line chart)
- Skill radar chart
- AI-generated career insights and recommendations

---

## 📁 Project Structure

```
3boxesjobportal/
├── prisma/
│   └── schema.prisma          # Database schema (12+ models)
├── src/
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   │   ├── ai-interview/  # AI mock interview endpoints
│   │   │   ├── analytics/     # Analytics & insights
│   │   │   ├── applications/  # Application management
│   │   │   ├── auth/          # Authentication (login/register/me)
│   │   │   ├── jobs/          # Job CRUD operations
│   │   │   ├── notifications/ # Notification management
│   │   │   ├── resumes/       # Resume CRUD + AI generation
│   │   │   ├── seed/          # Database seeding
│   │   │   ├── skills/        # Skill assessment endpoints
│   │   │   └── training/      # Training enrollment & completion
│   │   ├── layout.tsx         # Root layout with metadata
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── portal/            # Business logic components
│   │   └── ui/                # shadcn/ui component library
│   ├── hooks/                 # Custom React hooks
│   └── lib/
│       ├── auth.ts            # Password hashing & token generation
│       ├── db.ts              # Prisma client singleton
│       ├── store.ts           # Zustand auth store
│       └── utils.ts           # Utility functions
├── db/                        # SQLite database files
├── docs/                      # Comprehensive documentation
├── public/                    # Static assets
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚢 Deployment on Vercel

### Option A: One-Click Deploy (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pmkshar/3boxesjobportal)

### Option B: Manual Deployment

1. **Fork or clone** this repository
2. **Connect to Vercel** — Import the GitHub repo in [Vercel Dashboard](https://vercel.com/new)
3. **Set environment variables** in Vercel Dashboard:
   - `DATABASE_URL` — Your database connection string (see below)

### Database Options for Production

SQLite is used for local development. For Vercel production, choose one:

| Option | Difficulty | DATABASE_URL Format |
|--------|-----------|-------------------|
| **Turso** (Recommended) | Easy | `libsql://your-db.turso.io` (SQLite-compatible edge DB) |
| **Vercel Postgres** | Easy | `postgres://user:pass@host/db` (change provider in schema.prisma to `postgresql`) |
| **Supabase** | Medium | `postgresql://user:pass@host/db` |
| **PlanetScale** | Medium | `mysql://user:pass@host/db` |

> **Note:** If switching from SQLite to PostgreSQL/MySQL, update `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"` or `"mysql"`.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Developer Guide](./docs/DEVELOPER_GUIDE.md) | Setup, architecture, and development workflows |
| [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md) | System architecture and technical specifications |
| [Functional Specification](./docs/FUNCTIONAL_SPECIFICATION.md) | Feature specifications and user stories |
| [API Reference](./docs/API_REFERENCE.md) | Complete API endpoint documentation |
| [Database Schema](./docs/DATABASE_SCHEMA.md) | Database models and relationships |
| [SOPs](./docs/SOP.md) | Standard Operating Procedures |
| [Contributing Guide](./docs/CONTRIBUTING.md) | How to contribute to the project |

---

## 📄 License

Proprietary — © 2024 3 Boxes Jobs. All rights reserved.
