# 3 Boxes Jobs — AI-Powered Job Portal

## 🚀 Overview

**3 Boxes Jobs** is India's first AI-powered career platform that combines intelligent job matching, AI resume building, mock interviews, skill auto-updates, and comprehensive analytics into a single unified platform. Built for job seekers, corporates, and recruiters.

## 🏗️ Architecture

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: SQLite via Prisma ORM
- **UI**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand (client) + TanStack Query (server)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Authentication**: Custom session-based auth with SHA-256 hashing

## 📁 Project Structure

```
3boxesjobportal/
├── prisma/
│   └── schema.prisma          # Database schema (14 models)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main SPA entry point
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Tailwind + custom CSS
│   │   └── api/               # REST API routes
│   │       ├── auth/          # Login, Register, Me
│   │       ├── jobs/          # Job CRUD
│   │       ├── applications/  # Application management
│   │       ├── resumes/       # Resume CRUD
│   │       ├── ai-interview/  # AI Mock Interview
│   │       ├── training/      # Training courses
│   │       ├── analytics/     # Dashboard analytics
│   │       ├── notifications/ # Notification system
│   │       ├── skills/        # Skill assessments
│   │       └── seed/          # Demo data seeder
│   ├── components/
│   │   ├── portal/            # Main application components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AuthDialog.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── JobSeekerDashboard.tsx
│   │   │   ├── CorporateDashboard.tsx
│   │   │   ├── RecruiterDashboard.tsx
│   │   │   ├── JobSearchView.tsx
│   │   │   ├── ApplicationsView.tsx
│   │   │   ├── ResumeBuilder.tsx
│   │   │   ├── AiInterviewView.tsx
│   │   │   ├── TrainingView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   └── ProfileView.tsx
│   │   └── ui/                # shadcn/ui components (48+)
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── auth.ts            # Auth utilities
│       ├── store.ts           # Zustand auth store
│       └── utils.ts           # Utility functions
├── docs/                      # Documentation
├── public/                    # Static assets
└── db/                        # SQLite database
```

## 🎯 Key Features

### For Job Seekers
- **AI Resume Builder** — Build/edit resumes with AI enhancement, auto-update on training completion
- **Smart Job Matching** — AI-powered match scores based on skills analysis
- **AI Mock Interviews** — Practice interviews with AI feedback on communication, technical, confidence
- **Skill Auto-Update** — Complete training and skills auto-update across profile and resume
- **Training Hub** — 8+ curated courses across categories
- **AI Analytics Dashboard** — Charts, insights, and career recommendations

### For Corporates
- **Job Posting** — Create and manage job listings
- **AI Candidate Matching** — Auto-scored applications
- **Application Management** — Track, shortlist, reject, offer pipeline
- **Company Profile** — Verified company profiles

### For Recruiters
- **Candidate Search** — Find candidates by skills, experience, location
- **Pipeline Management** — Track candidates through hiring stages
- **Interview Scheduling** — Manage interview calendar
- **Recruiter Analytics** — Placement metrics and performance

## 🔐 Role-Based Access

| Feature | Job Seeker | Corporate | Recruiter | Admin |
|---------|:----------:|:---------:|:---------:|:-----:|
| Job Search & Apply | ✅ | ❌ | ❌ | ✅ |
| Resume Builder | ✅ | ❌ | ❌ | ✅ |
| AI Mock Interview | ✅ | ❌ | ❌ | ✅ |
| Training Hub | ✅ | ❌ | ❌ | ✅ |
| Post Jobs | ❌ | ✅ | ❌ | ✅ |
| Manage Applications | ❌ | ✅ | ✅ | ✅ |
| Candidate Search | ❌ | ❌ | ✅ | ✅ |
| AI Analytics | ✅ | ✅ | ✅ | ✅ |

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up database
bun run db:push

# Seed demo data
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

## 🌐 Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
```
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=your-secret-key
```

## 📊 Database Schema

14 Prisma models with full relationships:
- User → JobSeekerProfile, CorporateProfile, RecruiterProfile
- Job → CorporateProfile, Application, SavedJob
- Resume → Application
- Application → Job, User, Resume
- AiInterviewSession → User
- TrainingCourse → TrainingEnrollment
- TrainingEnrollment → User, TrainingCourse
- SkillAssessment → User
- AnalyticsEvent → User
- Notification → User

## 🤖 AI Features

1. **AI Resume Enhancement** — Enhances professional summary with AI-generated content
2. **AI Skill Suggestions** — Recommends skills based on market trends
3. **AI Job Matching** — Calculates match percentage between candidate skills and job requirements
4. **AI Mock Interview** — Generates role-specific questions and evaluates responses
5. **AI Skill Auto-Update** — Automatically updates skills and resume when training is completed
6. **AI Career Insights** — Personalized recommendations based on profile analysis

## 📄 License

Proprietary — 3 Boxes Jobs © 2024
