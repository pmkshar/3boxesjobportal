# 3 Boxes Jobs — Technical Documentation

## 1. System Architecture

### 1.1 Technology Stack
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js 16 | 16.1.1 | React framework with App Router |
| Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| UI Library | shadcn/ui | Latest | Accessible component library |
| State | Zustand | 5.x | Client-side state management |
| Database | SQLite via Prisma | 6.x | ORM and data layer |
| Charts | Recharts | 2.15 | Data visualization |
| Animation | Framer Motion | 12.x | UI animations |
| Auth | Custom (SHA-256) | — | Session-based authentication |

### 1.2 Application Flow
```
User → Landing Page → Auth Dialog → Role-Based Dashboard
  ├── Job Seeker → Dashboard → Jobs/Applications/Resume/Interview/Training/Analytics
  ├── Corporate → Dashboard → Post Job/My Jobs/Applications/Profile/Analytics
  └── Recruiter → Dashboard → Search/Pipeline/Interviews/Analytics/Profile
```

### 1.3 API Architecture
All API routes follow REST conventions:
- **POST** for creation
- **GET** for retrieval with query parameters
- **PUT** for updates
- **DELETE** for removal

All responses return JSON with consistent structure:
```json
{
  "data": {},
  "error": null,
  "message": "Success message"
}
```

## 2. Database Design

### 2.1 Entity Relationship Diagram
```
User (1) ──→ (0..1) JobSeekerProfile
User (1) ──→ (0..1) CorporateProfile
User (1) ──→ (0..1) RecruiterProfile
User (1) ──→ (0..n) Resume
User (1) ──→ (0..n) Application
User (1) ──→ (0..n) Interview
User (1) ──→ (0..n) AiInterviewSession
User (1) ──→ (0..n) TrainingEnrollment
User (1) ──→ (0..n) SkillAssessment
User (1) ──→ (0..n) AnalyticsEvent
User (1) ──→ (0..n) Notification
User (1) ──→ (0..n) SavedJob

CorporateProfile (1) ──→ (0..n) Job
Job (1) ──→ (0..n) Application
Job (1) ──→ (0..n) SavedJob
Resume (0..1) ←── Application
TrainingCourse (1) ──→ (0..n) TrainingEnrollment
```

### 2.2 Key Enums
- **UserRole**: JOB_SEEKER, CORPORATE, RECRUITER, ADMIN
- **JobStatus**: DRAFT, ACTIVE, PAUSED, CLOSED, ARCHIVED
- **ApplicationStatus**: APPLIED, SCREENING, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN
- **InterviewType**: PHONE, VIDEO, IN_PERSON, AI_MOCK, TECHNICAL, HR

### 2.3 JSON Storage Fields
Several fields store complex data as JSON strings:
- Resume: experience, education, skills, certifications, projects, languages, achievements
- TrainingEnrollment: skillsAcquired
- SkillAssessment: evidence
- AnalyticsEvent: metadata
- AiInterviewSession: questions, responses, scores

## 3. Authentication System

### 3.1 Password Security
- Hashing: SHA-256 with server-side hashing
- Passwords are never stored in plaintext
- Verification: Constant-time comparison via hash matching

### 3.2 Session Management
- Token-based: Random 32-byte hex tokens generated on login
- Client-side: Zustand store with localStorage persistence
- Token passed via Authorization header for protected routes

### 3.3 Role-Based Access Control
```typescript
// Route-level access control
const roleAccess = {
  '/api/resumes': ['JOB_SEEKER', 'ADMIN'],
  '/api/jobs POST': ['CORPORATE', 'ADMIN'],
  '/api/applications GET': ['JOB_SEEKER', 'CORPORATE', 'RECRUITER', 'ADMIN'],
}
```

## 4. AI Features Implementation

### 4.1 AI Job Matching Algorithm
```
1. Extract required skills from job posting
2. Extract candidate skills from profile
3. Calculate skill overlap ratio: matchCount / totalRequired
4. Factor in experience years proximity
5. Generate AI match score (0-100)
6. Provide feedback based on score ranges
```

### 4.2 AI Mock Interview System
```
1. Generate questions based on job role (8-10 questions per session)
2. Questions categorized as: role_specific, general, behavioral
3. Timer-based responses (90-120 seconds per question)
4. Scoring algorithm:
   - Communication: Response length + structure analysis
   - Technical: Keyword matching against technical terms
   - Confidence: Assertive language detection
   - Overall: Weighted average (30% comm + 40% tech + 30% confidence)
5. Generate detailed feedback based on score ranges
```

### 4.3 Skill Auto-Update Flow
```
1. User completes training course → status = 'completed'
2. Skills from course extracted (skillsAcquired field)
3. Job Seeker Profile skills updated (appended with new skills)
4. Default Resume skills section updated automatically
5. SkillAssessment records created for each new skill
6. AnalyticsEvent recorded (training_completed)
7. Notification sent to user about auto-update
8. AI Skill Score incremented
```

### 4.4 AI Resume Enhancement
- Summary enhancement with professional language patterns
- Skill suggestions based on market analysis
- Template-based content generation for bullet points
- Real-time preview with professional formatting

## 5. API Reference

### 5.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new user account |
| POST | /api/auth/login | Login and get session token |
| GET | /api/auth/me | Get current user profile |

### 5.2 Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | Search/filter jobs |
| POST | /api/jobs | Create new job posting |
| GET | /api/jobs/[id] | Get job details |
| PUT | /api/jobs/[id] | Update job |
| DELETE | /api/jobs/[id] | Delete job |

### 5.3 Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/applications | Get applications (by user or job) |
| POST | /api/applications | Apply to job (with AI match scoring) |
| PUT | /api/applications | Update application status |

### 5.4 Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resumes | Get user resumes |
| POST | /api/resumes | Create resume |
| PUT | /api/resumes | Update resume |

### 5.5 AI Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai-interview | Start new interview session |
| PUT | /api/ai-interview | Submit responses and get scores |
| GET | /api/ai-interview | Get interview history |

### 5.6 Training
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/training | Get courses (with enrollment status) |
| POST | /api/training | Enroll in course |
| PUT | /api/training | Update enrollment progress/status |

### 5.7 Analytics & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics | Get dashboard analytics data |
| GET | /api/notifications | Get user notifications |
| PUT | /api/notifications | Mark notifications as read |
| GET | /api/skills | Get skill assessments |
| POST | /api/skills | Add new skill |

## 6. Security Considerations

- All passwords hashed with SHA-256 (upgrade to bcrypt recommended for production)
- Input validation on all API endpoints
- SQL injection protection via Prisma ORM parameterized queries
- CORS configured via Next.js
- XSS protection via React's built-in escaping
- Rate limiting recommended for production (not implemented in demo)

## 7. Performance Optimization

- Client-side state management with Zustand (minimal re-renders)
- Database queries optimized with Prisma includes
- Lazy loading of dashboard components
- Image optimization with Next.js Image component
- Chart rendering with Recharts virtual DOM
- SQLite for fast local reads (migrate to PostgreSQL for production)
