# 3 Boxes Jobs - AI-Powered Job Portal

## 🏠 Overview

**3 Boxes Jobs** is India's first AI-powered career platform designed to transform the job search and recruitment experience. The platform leverages artificial intelligence to provide smart resume building, automated skill updates, AI mock interviews, and intelligent job matching — all within a single, cohesive application.

## 🚀 Key Features

### For Job Seekers
- **AI Resume Builder** — Auto-generate and enhance resumes with AI. Skills auto-update when training is completed.
- **Smart Job Matching** — AI-powered job matching scores based on skills, experience, and preferences.
- **AI Mock Interviews** — Practice with AI-powered mock interviews and get real-time feedback on communication and technical skills.
- **Skill Auto-Update** — Complete training courses and your skills are automatically updated across your profile and resume.
- **Training Hub** — Access curated courses to upskill, with AI recommendations based on career goals and market trends.
- **AI Analytics Dashboard** — Comprehensive analytics with AI-driven insights and career recommendations.

### For Corporates
- **Job Posting** — Create optimized job postings with AI assistance.
- **AI Candidate Matching** — Get AI-scored candidate matches based on skills and requirements.
- **Application Management** — Track and manage applications through the hiring pipeline.
- **Analytics Dashboard** — View hiring metrics and performance data.

### For Recruiters
- **Candidate Search** — Source candidates based on skills, experience, and location.
- **Pipeline Management** — Track candidates through sourcing, screening, interview, and offer stages.
- **Interview Scheduling** — Schedule and manage interviews with candidates.
- **Placement Analytics** — Track placement metrics and recruiter performance.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Authentication | Custom JWT-based auth |
| State Management | Zustand + TanStack Query |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Package Manager | Bun |

## 📁 Project Structure

```
3boxesjobportal/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── ai-interview/  # AI mock interview endpoints
│   │   │   ├── analytics/     # Analytics endpoints
│   │   │   ├── applications/  # Application management
│   │   │   ├── auth/          # Authentication (login/register/me)
│   │   │   ├── jobs/          # Job CRUD operations
│   │   │   ├── notifications/ # Notification management
│   │   │   ├── resumes/       # Resume CRUD + AI generation
│   │   │   ├── seed/          # Database seeding
│   │   │   ├── skills/        # Skill assessment endpoints
│   │   │   └── training/      # Training enrollment & completion
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── portal/            # Business components
│   │   │   ├── AiInterviewView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   ├── ApplicationsView.tsx
│   │   │   ├── AuthDialog.tsx
│   │   │   ├── CorporateDashboard.tsx
│   │   │   ├── JobSearchView.tsx
│   │   │   ├── JobSeekerDashboard.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProfileView.tsx
│   │   │   ├── RecruiterDashboard.tsx
│   │   │   ├── ResumeBuilder.tsx
│   │   │   └── TrainingView.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts            # Password hashing & token generation
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── store.ts           # Zustand auth store
│   │   └── utils.ts           # Utility functions
│   └── ...
├── db/                        # SQLite database files
├── docs/                      # Documentation
├── public/                    # Static assets
├── .env                       # Environment variables
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

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
# Edit .env with your configuration

# Push database schema
bun run db:push

# Seed the database with demo data
# The database is auto-seeded on first page load, or you can:
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

## 🔐 Role-Based Access Control (RBAC)

The platform implements four distinct user roles:

1. **JOB_SEEKER** — Can search jobs, build resumes, take AI interviews, enroll in training, and track analytics
2. **CORPORATE** — Can post jobs, review applications, manage company profile, and view hiring analytics
3. **RECRUITER** — Can search candidates, manage pipeline, schedule interviews, and track placement metrics
4. **ADMIN** — Full system access with administrative capabilities

## 🤖 AI Features

### Skill Auto-Update System
When a job seeker completes a training course:
1. The training completion triggers an enrollment status update to "completed"
2. The skills listed in the course are automatically added to the user's `SkillAssessment` records
3. The user's `JobSeekerProfile.skills` field is automatically updated
4. All active resumes receive an AI update timestamp and skill refresh
5. The `aiSkillScore` is recalculated based on the updated skill profile

### AI Mock Interview
The AI mock interview system:
1. Generates role-specific interview questions based on job role, industry, and difficulty
2. Provides timed question sessions with categories (General, Technical, Behavioral, Problem-Solving)
3. Scores responses across Communication, Technical, and Confidence dimensions
4. Delivers detailed AI feedback with improvement suggestions

### AI Analytics
The analytics dashboard provides:
- Application status distribution (pie chart)
- Skill assessment levels (bar chart)
- Recent activity trends (line chart)
- Interview score trends (multi-line chart)
- Skill radar chart
- AI-generated career insights and recommendations

## 📚 Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- [Functional Specification](./FUNCTIONAL_SPECIFICATION.md)
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Standard Operating Procedures](./SOP.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 📄 License

Proprietary — © 2024 3 Boxes Jobs. All rights reserved.
