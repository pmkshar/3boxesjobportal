# 3 Boxes Jobs — Developer Documentation

## 1. Getting Started

### 1.1 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Bun | 1.0+ | Package manager & build tool |
| Git | 2.40+ | Version control |
| VS Code | Latest | Recommended IDE |

### 1.2 Local Development Setup

```bash
# Clone the repository
git clone https://github.com/pmkshar/3boxesjobportal.git
cd 3boxesjobportal

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
bun run db:push

# Seed demo data (optional, recommended for first-time setup)
curl -X POST http://localhost:3000/api/seed

# Start the development server
bun run dev
```

The application will be available at `http://localhost:3000`.

### 1.3 Demo Accounts

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Job Seeker | seeker@3boxes.com | demo123 | Testing job search, applications, resume, interview, training |
| Corporate | corp@3boxes.com | demo123 | Testing job posting, application management |
| Recruiter | recruiter@3boxes.com | demo123 | Testing candidate search, pipeline management |
| Admin | admin@3boxes.com | demo123 | Full system access |

### 1.4 Environment Variables

```env
# Database
DATABASE_URL=file:./db/custom.db

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_NAME=3 Boxes Jobs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Project Architecture

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.x | React framework with App Router |
| Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| UI Components | shadcn/ui | Latest | Pre-built accessible components |
| State Management | Zustand | 5.x | Client-side global state |
| Database | SQLite / Prisma | 6.x | ORM and data persistence |
| Charts | Recharts | 2.15 | Data visualization |
| Animations | Framer Motion | 12.x | UI transition animations |
| Authentication | Custom SHA-256 | — | Password hashing & session tokens |

### 2.2 Application Flow

```
User Request → Next.js App Router → Server Component / API Route
                                         ↓
                                   Prisma ORM → SQLite Database
                                         ↓
                                   JSON Response → Client Component
                                         ↓
                                   Zustand Store (State Update)
                                         ↓
                                   UI Re-render (React)
```

### 2.3 Directory Structure

```
3boxesjobportal/
├── prisma/
│   └── schema.prisma              # Database schema (14 models, 4 enums)
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main SPA entry point (client component)
│   │   ├── layout.tsx             # Root layout with fonts, metadata, toaster
│   │   ├── globals.css            # Tailwind CSS + custom styles
│   │   └── api/                   # RESTful API routes
│   │       ├── auth/
│   │       │   ├── login/route.ts     # POST - User authentication
│   │       │   ├── register/route.ts  # POST - User registration
│   │       │   └── me/route.ts        # GET - Current user profile
│   │       ├── jobs/
│   │       │   ├── route.ts           # GET, POST - Job listing & creation
│   │       │   └── [id]/route.ts      # GET, PUT, DELETE - Single job CRUD
│   │       ├── applications/route.ts  # GET, POST, PUT - Application management
│   │       ├── resumes/route.ts       # GET, POST, PUT - Resume CRUD
│   │       ├── ai-interview/route.ts  # GET, POST, PUT - AI Mock Interview
│   │       ├── training/route.ts      # GET, POST, PUT - Training enrollment
│   │       ├── analytics/route.ts     # GET - Dashboard analytics
│   │       ├── notifications/route.ts # GET, PUT - Notification system
│   │       ├── skills/route.ts        # GET, POST - Skill assessments
│   │       └── seed/route.ts          # POST - Demo data seeder
│   ├── components/
│   │   ├── portal/                    # Application-specific components
│   │   │   ├── LandingPage.tsx        # Public landing page with hero, features
│   │   │   ├── AuthDialog.tsx         # Login/Register dialog
│   │   │   ├── Navbar.tsx             # Top navigation bar
│   │   │   ├── JobSeekerDashboard.tsx # Job seeker main view with sidebar
│   │   │   ├── CorporateDashboard.tsx # Corporate employer main view
│   │   │   ├── RecruiterDashboard.tsx # Recruiter main view
│   │   │   ├── JobSearchView.tsx      # Job search with filters & apply
│   │   │   ├── ApplicationsView.tsx   # Application tracking with status
│   │   │   ├── ResumeBuilder.tsx      # AI-powered resume editor
│   │   │   ├── AiInterviewView.tsx    # AI mock interview system
│   │   │   ├── TrainingView.tsx       # Training course catalog & enrollment
│   │   │   ├── AnalyticsView.tsx      # AI analytics dashboard with charts
│   │   │   └── ProfileView.tsx        # User profile management
│   │   └── ui/                        # 48+ shadcn/ui components
│   └── lib/
│       ├── db.ts                      # Prisma client singleton
│       ├── auth.ts                    # Password hashing & token generation
│       ├── store.ts                   # Zustand auth store with persistence
│       └── utils.ts                   # Utility functions (cn helper)
├── docs/                              # Project documentation
├── db/                                # SQLite database files
├── public/                            # Static assets (logo, robots.txt)
├── package.json                       # Dependencies & scripts
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
└── next.config.ts                     # Next.js configuration
```

### 2.4 Client-Side Architecture

The application is a Single Page Application (SPA) built with client components:

- **State Management**: Zustand store (`src/lib/store.ts`) manages authentication state with localStorage persistence
- **Routing**: View-based routing within each dashboard (no page refreshes, state-driven rendering)
- **Role-Based Rendering**: The main `page.tsx` renders different dashboards based on user role:
  - `JOB_SEEKER` → `JobSeekerDashboard` (8 views)
  - `CORPORATE` → `CorporateDashboard` (6 views)
  - `RECRUITER` → `RecruiterDashboard` (6 views)

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
                    ┌─────────────────────┐
                    │        User         │
                    ├─────────────────────┤
                    │ id (PK, cuid)       │
                    │ email (Unique)      │
                    │ name               │
                    │ password (SHA-256)  │
                    │ role (Enum)        │
                    │ phone, location    │
                    │ avatar, bio        │
                    │ isActive           │
                    │ emailVerified      │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│JobSeekerProfile │ │ CorporateProfile │ │ RecruiterProfile │
├─────────────────┤ ├──────────────────┤ ├──────────────────┤
│ headline        │ │ companyName      │ │ specialization   │
│ experienceYears │ │ industry         │ │ yearsExperience  │
│ currentRole     │ │ companySize      │ │ certifications   │
│ education       │ │ website          │ │ placementCount   │
│ skills          │ │ description      │ │ rating           │
│ aiSkillScore    │ │ isVerified       │ │                  │
│ profileComplete │ │                  │ │                  │
└─────────────────┘ └────────┬─────────┘ └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │       Job        │
                    ├──────────────────┤
                    │ title            │
                    │ description      │
                    │ requirements     │
                    │ salaryMin/Max    │
                    │ jobType          │
                    │ location         │
                    │ isRemote         │
                    │ skills           │
                    │ benefits         │
                    │ status (Enum)    │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────────────┐
│   Application    │ │   SavedJob   │ │   AiInterviewSession  │
├──────────────────┤ ├──────────────┤ ├───────────────────────┤
│ coverLetter      │ │              │ │ jobRole               │
│ status (Enum)    │ │              │ │ difficulty            │
│ aiMatchScore     │ │              │ │ questions (JSON)      │
│ aiFeedback       │ │              │ │ responses (JSON)      │
└──────────────────┘ │              │ │ overallScore          │
                     └──────────────┘ │ communicationScore    │
                                      │ technicalScore        │
                                      │ confidenceScore       │
                                      │ aiFeedback            │
                                      └───────────────────────┘

┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│     Resume       │    │   TrainingCourse     │    │ SkillAssessment  │
├──────────────────┤    ├──────────────────────┤    ├──────────────────┤
│ title            │    │ title                │    │ skillName        │
│ summary          │    │ description          │    │ level (0-100)    │
│ experience (JSON)│    │ category             │    │ source           │
│ education (JSON) │    │ level                │    │ evidence (JSON)  │
│ skills (JSON)    │    │ duration             │    └──────────────────┘
│ certifications   │    │ skills               │
│ projects (JSON)  │    │ instructor           │
│ languages (JSON) │    │ rating               │
│ template         │    └──────────┬───────────┘
│ isDefault        │               │
│ aiGenerated      │               ▼
│ lastAiUpdate     │    ┌──────────────────────┐
└──────────────────┘    │ TrainingEnrollment   │
                        ├──────────────────────┤
┌──────────────────┐    │ progress (0-100)     │
│AnalyticsEvent    │    │ status               │
├──────────────────┤    │ score                │
│ eventType        │    │ skillsAcquired (JSON)│
│ category         │    │ certificate          │
│ metadata (JSON)  │    └──────────────────────┘
│ timestamp        │
└──────────────────┘    ┌──────────────────┐
                        │  Notification    │
                        ├──────────────────┤
                        │ title            │
                        │ message          │
                        │ type             │
                        │ isRead           │
                        │ link             │
                        └──────────────────┘
```

### 3.2 Enums

```typescript
enum UserRole {
  JOB_SEEKER    // Individual looking for employment
  CORPORATE     // Company/employer posting jobs
  RECRUITER     // Recruitment professional sourcing candidates
  ADMIN         // System administrator with full access
}

enum JobStatus {
  DRAFT         // Job created but not yet published
  ACTIVE        // Job is live and accepting applications
  PAUSED        // Temporarily stopped accepting applications
  CLOSED        // No longer accepting applications
  ARCHIVED      // Historical record, no longer visible
}

enum ApplicationStatus {
  APPLIED                // Initial application submitted
  SCREENING              // Under initial review
  SHORTLISTED            // Passed initial screening
  INTERVIEW_SCHEDULED    // Interview has been scheduled
  INTERVIEWED            // Interview completed
  OFFERED                // Job offer extended
  HIRED                  // Candidate hired
  REJECTED               // Application declined
  WITHDRAWN              // Candidate withdrew application
}

enum InterviewType {
  PHONE       // Phone screening
  VIDEO       // Video call interview
  IN_PERSON   // Face-to-face interview
  AI_MOCK     // AI-powered mock interview
  TECHNICAL   // Technical assessment
  HR          // HR/cultural fit interview
}
```

### 3.3 JSON Field Schemas

Several database fields store complex data as JSON strings. Here are their schemas:

#### Resume.experience (JSON Array)
```json
[
  {
    "company": "TechCorp India",
    "role": "Senior Software Engineer",
    "duration": "2022 - Present",
    "description": "Led frontend architecture..."
  }
]
```

#### Resume.education (JSON Array)
```json
[
  {
    "institution": "IIT Mumbai",
    "degree": "B.Tech in Computer Science",
    "year": "2018",
    "grade": "8.5 CGPA"
  }
]
```

#### Resume.skills (JSON Array)
```json
[
  {
    "name": "React",
    "level": "Expert",
    "source": "Experience"
  }
]
```

#### AiInterviewSession.questions (JSON Array)
```json
[
  {
    "id": 1,
    "question": "Tell me about...",
    "type": "role_specific",
    "category": "technical",
    "timeLimit": 120
  }
]
```

#### TrainingEnrollment.skillsAcquired (JSON Array)
```json
["React", "TypeScript", "Redux Toolkit"]
```

## 4. API Reference

### 4.1 Authentication APIs

#### POST /api/auth/register
Create a new user account with role-specific profile.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securepassword",
  "role": "JOB_SEEKER",
  "companyName": "Required for CORPORATE role",
  "industry": "Optional for CORPORATE",
  "companySize": "Optional for CORPORATE",
  "specialization": "Optional for RECRUITER"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "cmreb7nv...",
    "email": "rahul@example.com",
    "name": "Rahul Sharma",
    "role": "JOB_SEEKER"
  },
  "message": "Registration successful"
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - Email already registered
- `500` - Server error

#### POST /api/auth/login
Authenticate user and get session token.

**Request Body:**
```json
{
  "email": "seeker@3boxes.com",
  "password": "demo123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "cmreb7nv...",
    "email": "seeker@3boxes.com",
    "name": "Rahul Sharma",
    "role": "JOB_SEEKER",
    "avatar": null,
    "phone": "+91-9876543210",
    "location": "Mumbai, India",
    "profile": { ... }
  },
  "token": "1b4514496d590863..."
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `403` - Account deactivated

#### GET /api/auth/me?userId={id}
Get current user profile with role-specific data.

**Response (200):**
```json
{
  "id": "cmreb7nv...",
  "email": "seeker@3boxes.com",
  "name": "Rahul Sharma",
  "role": "JOB_SEEKER",
  "jobSeekerProfile": { ... },
  "corporateProfile": null,
  "recruiterProfile": null
}
```

### 4.2 Job APIs

#### GET /api/jobs?search=&jobType=&location=&isRemote=&skills=&experienceMin=&page=&limit=
Search and filter job listings.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | string | "" | Search in title, description, skills, location |
| jobType | string | "" | Filter: full-time, part-time, contract, remote |
| location | string | "" | Filter by location (partial match) |
| isRemote | string | "" | Filter remote jobs (value: "true") |
| skills | string | "" | Filter by required skills (partial match) |
| experienceMin | number | null | Filter by minimum experience |
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Results per page |

**Response (200):**
```json
{
  "jobs": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### POST /api/jobs
Create a new job posting (Corporate role only).

**Request Body:**
```json
{
  "corporateId": "cmreb7nw...",
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "requirements": "5+ years React experience...",
  "responsibilities": "Build reusable UI components...",
  "salaryMin": 1200000,
  "salaryMax": 2000000,
  "jobType": "full-time",
  "experienceMin": 5,
  "experienceMax": 8,
  "location": "Bangalore, India",
  "isRemote": true,
  "skills": "React, TypeScript, GraphQL",
  "benefits": "Health insurance, Stock options",
  "openings": 3,
  "closingDate": "2024-12-31"
}
```

#### GET /api/jobs/[id]
Get single job with corporate details and application summary.

#### PUT /api/jobs/[id]
Update job posting (status changes, edit details).

#### DELETE /api/jobs/[id]
Delete a job posting.

### 4.3 Application APIs

#### GET /api/applications?userId=&jobId=
Get applications by user or job. Includes job details, corporate info, and user info.

#### POST /api/applications
Apply to a job with automatic AI match scoring.

**Request Body:**
```json
{
  "jobId": "cmrec6ba...",
  "userId": "cmreb7nv...",
  "resumeId": "optional-resume-id",
  "coverLetter": "Optional cover letter text"
}
```

**AI Match Score Calculation:**
1. Extract required skills from job posting
2. Extract candidate skills from profile
3. Calculate overlap ratio: `matchedCount / totalRequired`
4. Score range: 0-100
5. Auto-generate feedback based on score

#### PUT /api/applications
Update application status. Triggers notification to applicant.

**Request Body:**
```json
{
  "id": "application-id",
  "status": "SHORTLISTED"
}
```

### 4.4 Resume APIs

#### GET /api/resumes?userId={id}
Get all resumes for a user.

#### POST /api/resumes
Create a new resume with all sections.

#### PUT /api/resumes
Update resume. Supports setting default resume (unsets other defaults).

### 4.5 AI Interview APIs

#### POST /api/ai-interview
Start a new AI mock interview session.

**Request Body:**
```json
{
  "userId": "cmreb7nv...",
  "jobRole": "Software Engineer",
  "industry": "IT",
  "difficulty": "intermediate"
}
```

**Question Generation Logic:**
- Questions are role-specific (8-10 per session)
- Categories: role_specific, general, behavioral
- Difficulty determines question count: beginner=5, intermediate=7, advanced=10
- Time limits: 90s for behavioral, 120s for technical

#### PUT /api/ai-interview
Submit interview responses for AI scoring.

**Scoring Algorithm:**
- **Communication** (30% weight): Response length + structure analysis
- **Technical** (40% weight): Technical keyword matching
- **Confidence** (30% weight): Assertive language detection
- **Overall**: Weighted average of three scores

#### GET /api/ai-interview?userId={id}
Get interview history for a user.

### 4.6 Training APIs

#### GET /api/training?category=&level=&userId=
Get course catalog with optional filters. When `userId` is provided, includes enrollment status for each course.

#### POST /api/training
Enroll in a training course.

**Request Body:**
```json
{
  "userId": "cmreb7nv...",
  "courseId": "react-advanced-patterns-performance"
}
```

#### PUT /api/training
Update enrollment progress or mark as completed. **This is the Skill Auto-Update trigger.**

**Request Body (Complete Course):**
```json
{
  "enrollmentId": "enrollment-id",
  "progress": 100,
  "status": "completed",
  "score": 85,
  "skillsAcquired": ["React", "TypeScript", "Redux Toolkit"]
}
```

**Auto-Update Cascade (on status=completed):**
1. Update `JobSeekerProfile.skills` — append new skills
2. Update `JobSeekerProfile.aiSkillScore` — increment by 5
3. Update default `Resume.skills` — add new skill entries with source "Training"
4. Update `Resume.lastAiUpdate` — set to current timestamp
5. Create `SkillAssessment` records — one per new skill, level=60, source="training"
6. Create `AnalyticsEvent` — eventType="training_completed"
7. Create `Notification` — inform user of skill auto-update

### 4.7 Analytics APIs

#### GET /api/analytics?userId={id}
Comprehensive analytics data for AI dashboard.

**Response includes:**
- `summary`: Aggregated counts and scores
- `applicationByStatus`: Grouped by ApplicationStatus
- `skillDistribution`: Skill name → level mapping
- `interviewSessions`: Recent AI interview sessions
- `skillAssessments`: All skill assessments
- `recentApplications`: Latest 5 applications with job/corporate info
- `monthlyActivity`: Date → event count mapping

### 4.8 Skill & Notification APIs

#### GET /api/skills?userId={id}
Get skill assessments and profile skills.

#### POST /api/skills
Add a new skill (also updates profile skills).

#### GET /api/notifications?userId={id}
Get notifications with unread count.

#### PUT /api/notifications
Mark notifications as read (individual or all).

### 4.9 Seed API

#### POST /api/seed
Create demo data including users, jobs, training courses, resume, skill assessments, and notifications. Uses upsert for idempotency.

## 5. Component Architecture

### 5.1 Component Hierarchy

```
page.tsx (Root)
├── LandingPage (Unauthenticated)
│   ├── ThreeBoxesLogo
│   ├── Hero Section
│   ├── Features Section
│   ├── How It Works Section
│   ├── Testimonials Section
│   ├── CTA Section
│   ├── Footer
│   └── AuthDialog
│       ├── Login Form
│       └── Register Form (with role selection)
│
├── JobSeekerDashboard (Authenticated - JOB_SEEKER)
│   ├── Navbar
│   ├── Sidebar (8 navigation items)
│   ├── Mobile Bottom Nav
│   ├── DashboardHome (welcome + stats + quick actions + AI insights)
│   ├── JobSearchView (search + filters + job cards + apply dialog)
│   ├── ApplicationsView (status filter + application cards)
│   ├── ResumeBuilder (multi-section editor + AI enhance + preview)
│   ├── AiInterviewView (setup → interview → results → history)
│   ├── TrainingView (catalog + enroll + complete + auto-update notice)
│   ├── AnalyticsView (8 metric cards + 5 chart types + AI insights)
│   └── ProfileView (profile completeness + professional info + skills)
│
├── CorporateDashboard (Authenticated - CORPORATE)
│   ├── Navbar
│   ├── Sidebar (6 navigation items)
│   ├── CorpDashboardHome (stats + recent jobs + quick actions)
│   ├── PostJobForm (complete job creation form)
│   ├── MyJobsList (job cards with status badges)
│   ├── CorpApplications (application review with shortlist/reject)
│   ├── CompanyProfile (company details editor)
│   └── CorpAnalytics (job metrics)
│
└── RecruiterDashboard (Authenticated - RECRUITER)
    ├── Navbar
    ├── Sidebar (6 navigation items)
    ├── RecruiterDashboardHome (stats + quick actions + recent activity)
    ├── CandidateSearch (search form + results)
    ├── PipelineView (stage-based kanban)
    ├── InterviewsView (interview calendar)
    ├── RecruiterAnalytics (placement metrics)
    └── RecruiterProfile (recruiter details)
```

### 5.2 State Management

The application uses Zustand for client-side state management with localStorage persistence:

```typescript
// src/lib/store.ts
interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  setLoading: (loading: boolean) => void
}
```

**Persistence**: Auth state is persisted to localStorage under key `3boxes-auth`, allowing page refreshes to maintain login state.

### 5.3 Key Design Patterns

1. **View-Based Navigation**: Each dashboard uses a `View` type union and `activeView` state for client-side navigation without page reloads.

2. **API Data Fetching**: Components fetch data in `useEffect` hooks on mount or when dependencies change. Loading states use skeleton animations.

3. **Optimistic Updates**: Some actions (like skill addition) update the UI immediately, with API calls happening in the background.

4. **Toast Notifications**: All user actions (apply, enroll, save, error) provide feedback via Sonner toast notifications.

5. **Role-Based Rendering**: The root page.tsx switches between dashboards based on `user.role`.

## 6. AI Feature Implementation Details

### 6.1 AI Job Matching Algorithm

```
Input: jobId, userId
1. Fetch job.requiredSkills (comma-separated)
2. Fetch profile.skills (comma-separated)
3. Normalize both lists to lowercase
4. For each job skill:
   - Check if any user skill contains the job skill substring OR vice versa
   - Count matches
5. Calculate: aiMatchScore = (matchCount / jobSkillCount) * 100
6. Generate feedback:
   - score > 70: "Great match!"
   - score 50-70: "Good match, consider adding more skills"
   - score < 50: "Low match, improve skill alignment"
```

### 6.2 AI Mock Interview Scoring

```
Input: Array of { question, text (response) }

For each response:
  Communication Score:
    - wordCount > 30: 70 + (wordCount / 10), capped at 100
    - wordCount <= 30: wordCount * 2, minimum 20

  Technical Score:
    - Count matches against techKeywords: ['algorithm', 'system', 'design',
      'architecture', 'database', 'api', 'framework', 'testing', 'deploy',
      'optimize', 'scalable', 'performance', 'security', 'data', 'model']
    - Score = 40 + (matches * 12), capped at 100, minimum 25

  Confidence Score:
    - Count matches against confidentWords: ['achieved', 'led', 'implemented',
      'delivered', 'improved', 'designed', 'built', 'managed', 'created', 'solved']
    - Score = 40 + (matches * 10), capped at 100, minimum 25

  Overall = round(comm * 0.3 + tech * 0.4 + confidence * 0.3)

Feedback Generation:
  - overall >= 80: "Excellent performance! ..."
  - overall >= 60: "Good performance with room for improvement. ..."
  - overall >= 40: "Fair performance. Work on providing more detail. ..."
  - overall < 40: "Needs significant improvement. ..."
```

### 6.3 Skill Auto-Update Flow

```
Trigger: Training course marked as completed (PUT /api/training)

1. Parse skillsAcquired from request body
2. Fetch user's JobSeekerProfile
3. Append new skills to existing skills (comma-separated, deduplicated)
4. Increment aiSkillScore by 5 points
5. Fetch user's default Resume
6. Parse existing resume.skills (JSON array)
7. Append new skills with { name, level: 'Intermediate', source: 'Training' }
8. Update resume.lastAiUpdate to current timestamp
9. Create SkillAssessment for each new skill:
   - level: 60 (intermediate baseline for training-acquired skills)
   - source: 'training'
   - evidence: { courseId, score }
10. Create AnalyticsEvent:
    - eventType: 'training_completed'
    - category: 'training'
    - metadata: { courseId, skillsAcquired }
11. Create Notification:
    - title: 'Training Completed! Skills Updated'
    - message: Lists auto-updated skills
    - type: 'success'
```

### 6.4 AI Resume Enhancement

The resume builder provides AI-powered features:

1. **AI Enhance Summary**: Generates professional summary text based on existing resume data
2. **AI Suggest Skills**: Recommends skills based on current market trends and user's existing skill set
3. **Auto-Update on Training**: When training is completed, skills automatically appear in the resume with "Training" source label
4. **AI Updated Badge**: Shows timestamp of last AI auto-update

## 7. Security Considerations

### 7.1 Current Implementation
- Password hashing via SHA-256 (server-side)
- No plaintext password storage
- Input validation on all API endpoints
- SQL injection protection via Prisma ORM parameterized queries
- XSS protection via React's built-in output escaping

### 7.2 Production Recommendations
- **Upgrade to bcrypt** for password hashing (SHA-256 is fast, making it less resistant to brute force)
- **Implement JWT** for proper token-based authentication with expiration
- **Add rate limiting** on authentication endpoints (e.g., 5 attempts per minute)
- **Add CORS** configuration for specific allowed origins
- **Enable CSRF protection** for state-changing operations
- **Add input sanitization** for user-generated content in resumes and cover letters
- **Implement file upload validation** for company logos and avatars
- **Add HTTPS enforcement** via middleware
- **Set up monitoring** for suspicious activity patterns

## 8. Performance Optimization

### 8.1 Current Optimizations
- Zustand state management minimizes re-renders
- Prisma includes for efficient data loading (avoiding N+1 queries)
- Client-side view routing (no full page reloads)
- SQLite for fast local reads

### 8.2 Production Recommendations
- Migrate from SQLite to PostgreSQL for concurrent access
- Implement server-side caching with Redis
- Add API response compression
- Use Next.js Image optimization for company logos
- Implement pagination with cursor-based approach for large datasets
- Add database indexing on frequently queried fields (email, status, corporateId)
- Consider SSR for landing page SEO

## 9. Testing Guide

### 9.1 Manual Testing Checklist

**Authentication Flow:**
- [ ] Register new Job Seeker account
- [ ] Register new Corporate account with company details
- [ ] Register new Recruiter account with specialization
- [ ] Login with demo accounts
- [ ] Login with invalid credentials (should fail)
- [ ] Logout and verify redirect to landing page

**Job Seeker Flow:**
- [ ] View dashboard with stats and quick actions
- [ ] Search jobs with filters (search text, job type, remote)
- [ ] View job details dialog
- [ ] Apply to a job (verify AI match score)
- [ ] View applications with status filter
- [ ] Build resume with all sections
- [ ] Use AI enhance summary feature
- [ ] Start AI mock interview
- [ ] Complete interview and view results
- [ ] Enroll in training course
- [ ] Complete training (verify skill auto-update)
- [ ] View analytics dashboard with charts
- [ ] Edit profile and add skills

**Corporate Flow:**
- [ ] View corporate dashboard
- [ ] Post a new job with all fields
- [ ] View posted jobs list
- [ ] Review applications with AI match scores
- [ ] Shortlist/reject candidates
- [ ] Edit company profile

**Recruiter Flow:**
- [ ] View recruiter dashboard
- [ ] Search candidates
- [ ] View pipeline stages
- [ ] View recruiter analytics
- [ ] Edit recruiter profile

### 9.2 API Testing with cURL

```bash
# Seed database
curl -X POST http://localhost:3000/api/seed

# Login as Job Seeker
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seeker@3boxes.com","password":"demo123"}'

# Get jobs
curl "http://localhost:3000/api/jobs?search=React&limit=5"

# Get analytics
curl "http://localhost:3000/api/analytics?userId=YOUR_USER_ID"

# Start AI Interview
curl -X POST http://localhost:3000/api/ai-interview \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR_USER_ID","jobRole":"Software Engineer","difficulty":"intermediate"}'

# Enroll in training
curl -X POST http://localhost:3000/api/training \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR_USER_ID","courseId":"react-advanced-patterns-performance"}'
```

## 10. Deployment

### 10.1 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 10.2 Environment Variables for Production

Set these in Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL` - PostgreSQL connection string (recommended for production)
- `NEXTAUTH_SECRET` - Strong random secret key
- `NEXTAUTH_URL` - Your production domain

### 10.3 Production Database Migration

For production, migrate from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Run migration:
```bash
bun run db:push
```

3. Seed production data as needed

## 11. Contributing

### 11.1 Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and test locally
3. Run linter: `bun run lint`
4. Commit with descriptive messages: `git commit -m "feat: add AI skill recommendation"`
5. Push to GitHub: `git push origin feature/your-feature-name`
6. Create Pull Request for review

### 11.2 Code Style Guidelines

- TypeScript strict mode enabled
- Use `'use client'` and `'use server'` directives appropriately
- Prefer shadcn/ui components over custom implementations
- Follow Tailwind CSS utility-first approach
- Use Zustand for global state, local useState for component state
- All API routes must have proper error handling and input validation
- Use Prisma for all database operations (no raw SQL)

### 11.3 Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Build/dependency changes
```
