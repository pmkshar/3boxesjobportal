# 3 Boxes Jobs - Developer Guide

## 1. Architecture Overview

3 Boxes Jobs follows a modern full-stack architecture using Next.js 16 with the App Router pattern. The application is a single-page application (SPA) that renders different portals based on the authenticated user's role. The backend is implemented as Next.js API routes, with Prisma ORM for database access.

### Architecture Diagram (Text)

```
┌─────────────────────────────────────────────┐
│                   Client                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Landing │ │  Auth     │ │ Role-Based   │ │
│  │ Page    │ │ Dialog    │ │ Dashboards   │ │
│  └─────────┘ └──────────┘ └──────────────┘ │
│         │          │            │            │
│         └──────────┴────────────┘            │
│                    │                         │
│              Zustand Store                   │
│           (Auth + Token State)               │
└────────────────────┬────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────┐
│              Next.js API Routes              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐ │
│  │ Auth │ │ Jobs │ │ Train│ │ AI Interview│ │
│  └──────┘ └──────┘ └──────┘ └────────────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐ │
│  │ Resu │ │ Appl │ │ Skill│ │ Analytics  │ │
│  └──────┘ └──────┘ └──────┘ └────────────┘ │
└────────────────────┬────────────────────────┘
                     │ Prisma Client
┌────────────────────▼────────────────────────┐
│              SQLite Database                 │
│  (Users, Profiles, Jobs, Resumes, etc.)     │
└─────────────────────────────────────────────┘
```

## 2. Folder Structure

### `/src/app/api/` — API Routes
Each subdirectory maps to a REST endpoint group:
- `auth/` — Authentication (login, register, me)
- `jobs/` — Job CRUD and search
- `applications/` — Application management
- `resumes/` — Resume builder operations
- `ai-interview/` — AI mock interview sessions
- `training/` — Training enrollment and completion
- `skills/` — Skill assessment operations
- `analytics/` — Analytics data aggregation
- `notifications/` — Notification management
- `seed/` — Database seeding (demo data)

### `/src/components/portal/` — Business Components
These are the role-specific dashboard and feature components:
- `LandingPage.tsx` — Public landing page with hero, features, testimonials
- `AuthDialog.tsx` — Login/Register dialog with role selection
- `Navbar.tsx` — Top navigation with auth state
- `JobSeekerDashboard.tsx` — Job seeker portal with sidebar navigation
- `CorporateDashboard.tsx` — Corporate portal with job posting and management
- `RecruiterDashboard.tsx` — Recruiter portal with candidate search and pipeline
- `JobSearchView.tsx` — Job search with filters and pagination
- `ApplicationsView.tsx` — Application tracking
- `ResumeBuilder.tsx` — Full resume builder with AI enhancement
- `AiInterviewView.tsx` — AI mock interview setup, execution, and results
- `TrainingView.tsx` — Training course catalog with enrollment
- `AnalyticsView.tsx` — AI analytics dashboard with charts
- `ProfileView.tsx` — Profile editing with skill management

### `/src/components/ui/` — UI Component Library
Complete set of shadcn/ui components (Button, Card, Dialog, Tabs, etc.) — do NOT modify these unless absolutely necessary.

### `/src/lib/` — Core Libraries
- `db.ts` — Prisma client singleton with hot-reload protection
- `auth.ts` — Password hashing (SHA-256), verification, and token generation
- `store.ts` — Zustand store for auth state (persisted to localStorage)
- `utils.ts` — Utility functions (cn for className merging)

## 3. Environment Setup

### Required Environment Variables

```env
# Database
DATABASE_URL=file:./db/custom.db

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI SDK (for future z-ai-web-dev-sdk integration)
ZAI_API_KEY=your-api-key
```

### Development Setup

```bash
# 1. Clone and install
git clone https://github.com/pmkshar/3boxesjobportal.git
cd 3boxesjobportal
bun install

# 2. Database setup
bun run db:push    # Push schema to SQLite
bun run db:generate # Generate Prisma client

# 3. Start dev server
bun run dev

# 4. Seed demo data (auto-seeds on first page load or manual)
curl -X POST http://localhost:3000/api/seed
```

## 4. Authentication System

The authentication system is custom-built (not using NextAuth.js) for simplicity:

### Password Security
- Passwords are hashed using SHA-256 via Node.js `crypto` module
- Token generation uses `crypto.randomBytes(32).toString('hex')`

### Auth Flow
1. **Registration**: `POST /api/auth/register` creates user + role-specific profile
2. **Login**: `POST /api/auth/login` verifies credentials and returns user + token
3. **Session**: Token and user data stored in Zustand (persisted to localStorage under key `3boxes-auth`)
4. **Auth Check**: Client-side via `useAuthStore` — checks `isAuthenticated` and `user.role`
5. **Profile Fetch**: `GET /api/auth/me?userId=xxx` returns user with role-specific profile

### Role-Based Rendering
The main page (`page.tsx`) renders different dashboards based on `user.role`:
- `JOB_SEEKER` → `JobSeekerDashboard`
- `CORPORATE` → `CorporateDashboard`
- `RECRUITER` → `RecruiterDashboard`
- Unauthenticated → `LandingPage`

## 5. API Design Patterns

### Request/Response Format
All API routes follow RESTful conventions:
- **Success**: `{ data: ..., message: "..." }` or direct object
- **Error**: `{ error: "Error message" }` with appropriate HTTP status codes

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

### API Route Structure
Each route file exports named functions for HTTP methods:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }
export async function PUT(request: NextRequest) { ... }
export async function DELETE(request: NextRequest) { ... }
```

## 6. Database Operations

### Prisma Client Usage
Always import the singleton:
```typescript
import { db } from '@/lib/db'
```

### Common Patterns

**Creating with relations:**
```typescript
const user = await db.user.create({
  data: {
    email,
    name,
    password: hashedPassword,
    role,
    jobSeekerProfile: {
      create: { headline: 'Looking for opportunities' }
    }
  },
  include: { jobSeekerProfile: true }
})
```

**Filtering and pagination:**
```typescript
const jobs = await db.job.findMany({
  where: {
    status: 'ACTIVE',
    ...(search && { title: { contains: search } }),
  },
  include: { corporate: true, applications: true },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { postedDate: 'desc' },
})
```

**Upsert for seeding:**
```typescript
await db.user.upsert({
  where: { email: 'seeker@3boxes.com' },
  update: {},
  create: { email: 'seeker@3boxes.com', name: 'Rahul Sharma', ... }
})
```

## 7. Component Development

### Creating a New View Component
1. Create file in `src/components/portal/`
2. Use `'use client'` directive
3. Import `useAuthStore` for auth state
4. Follow the existing pattern with Card-based layouts
5. Add to the relevant Dashboard's navigation and render switch

### State Management
- **Auth State**: `useAuthStore` (Zustand) — user, token, isAuthenticated
- **Local Component State**: `useState` for view-specific state
- **Server State**: Direct `fetch()` calls with `useEffect` for data loading
- **Form State**: Controlled components with `useState`

### Styling Guidelines
- Use Tailwind CSS utility classes
- Use shadcn/ui components (Button, Card, Input, etc.)
- Primary color: Emerald (emerald-600/700)
- Corporate accent: Teal (teal-600/700)
- Recruiter accent: Cyan (cyan-600/700)
- Background: gray-50 for dashboards, white for cards
- Avoid indigo/blue as primary colors

## 8. Testing

### Manual Testing Flow
1. Visit landing page → verify hero, features, testimonials render
2. Click "Get Started" → register as Job Seeker → verify dashboard loads
3. Test demo accounts: seeker@3boxes.com / demo123
4. Navigate through all sidebar items in each role
5. Test AI Mock Interview flow (setup → interview → results)
6. Test Training enrollment and completion (verify skill auto-update)
7. Test Resume Builder (create, edit, AI enhance)
8. Test Job Search (filters, apply, pagination)
9. Test Corporate: post job, view applications
10. Test Recruiter: search candidates, view pipeline

### Lint Check
```bash
bun run lint
```

## 9. Deployment

### Vercel Deployment
The project is configured for Vercel deployment with:
- `vercel.json` for configuration
- SQLite database (note: ephemeral on Vercel — consider upgrading to PostgreSQL for production)
- Auto-deploy from GitHub `main` branch

### Production Considerations
1. **Database**: Switch from SQLite to PostgreSQL (update `prisma/schema.prisma` provider)
2. **Authentication**: Implement proper JWT with expiry, refresh tokens, and HTTP-only cookies
3. **File Storage**: Use cloud storage (S3/GCS) for resume PDFs and company logos
4. **AI Integration**: Replace mock AI responses with real z-ai-web-dev-sdk calls
5. **Email**: Add email service for notifications and verification
6. **Rate Limiting**: Add API rate limiting middleware
7. **CORS**: Configure CORS for production domains
