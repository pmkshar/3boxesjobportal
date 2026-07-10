# 3 Boxes Jobs - Technical Documentation

## 1. System Architecture

### High-Level Architecture

3 Boxes Jobs is built as a monolithic Next.js application with embedded API routes. The architecture follows the **Server-Side Rendering + Client-Side Hydration** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   Next.js Application                  │  │
│  │                                                        │  │
│  │  ┌──────────────┐    ┌──────────────────────────────┐  │  │
│  │  │  SSR/RSC     │    │     Client-Side SPA          │  │  │
│  │  │  (Layout,    │    │  (Dashboards, Forms,         │  │  │
│  │  │   Metadata)  │    │   Charts, Interactions)      │  │  │
│  │  └──────────────┘    └──────────────────────────────┘  │  │
│  │           │                       │                     │  │
│  │           └───────────┬───────────┘                     │  │
│  │                       │                                 │  │
│  │  ┌────────────────────▼────────────────────────────┐   │  │
│  │  │              API Route Layer                     │   │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐          │   │  │
│  │  │  │  Auth   │ │  Jobs   │ │ Training │          │   │  │
│  │  │  └─────────┘ └─────────┘ └──────────┘          │   │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐          │   │  │
│  │  │  │ Resume  │ │ AI Intv │ │Analytics │          │   │  │
│  │  │  └─────────┘ └─────────┘ └──────────┘          │   │  │
│  │  └────────────────────┬────────────────────────────┘   │  │
│  │                       │                                 │  │
│  │  ┌────────────────────▼────────────────────────────┐   │  │
│  │  │           Prisma ORM Layer                       │   │  │
│  │  │           (Query Builder + Client)               │   │  │
│  │  └────────────────────┬────────────────────────────┘   │  │
│  └────────────────────────┼────────────────────────────────┘  │
│                           │                                    │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │                SQLite Database                           │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │  │
│  │  │User  │ │ Job  │ │Resume│ │Train │ │Applic│        │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Authentication Flow
```
Client → POST /api/auth/login { email, password }
       → API: Verify password (SHA-256 hash comparison)
       → API: Generate token (randomBytes)
       → API: Return { user, token }
       → Client: Zustand store persists { user, token, isAuthenticated }
       → Client: Render role-specific dashboard
```

#### AI Skill Auto-Update Flow
```
Client → PUT /api/training { enrollmentId, progress: 100, status: "completed", skillsAcquired }
       → API: Update TrainingEnrollment (status=completed, score, skillsAcquired)
       → API: For each acquired skill:
              → Upsert SkillAssessment (source="training")
       → API: Update JobSeekerProfile.skills (append new skills)
       → API: Update all active Resumes (lastAiUpdate=now, refresh skills JSON)
       → API: Recalculate aiSkillScore
       → API: Create Notification ("Skills updated!")
       → Client: Toast notification + refresh data
```

#### AI Mock Interview Flow
```
Client → POST /api/ai-interview { userId, jobRole, industry, difficulty }
       → API: Generate questions based on role/industry/difficulty
       → API: Create AiInterviewSession
       → API: Return { session, questions }
       → Client: Display timed question interface
       → Client: Collect responses → PUT /api/ai-interview { sessionId, responses }
       → API: Score each response (communication, technical, confidence)
       → API: Calculate overall and category scores
       → API: Generate AI feedback
       → API: Update session with scores and feedback
       → Client: Display results with score breakdown
```

## 2. Security Architecture

### Current Security Measures

1. **Password Hashing**: SHA-256 with crypto module (should be upgraded to bcrypt/argon2 for production)
2. **Token-Based Auth**: Random 32-byte hex tokens (should be upgraded to JWT with expiry)
3. **Input Validation**: Basic validation in API routes (should add Zod schemas)
4. **SQL Injection**: Protected by Prisma ORM parameterized queries
5. **XSS Protection**: React's built-in JSX escaping + Next.js CSP headers

### Production Security Recommendations

1. **Upgrade Password Hashing**: Replace SHA-256 with bcrypt (cost factor 12+) or argon2id
2. **Implement JWT**: Use HTTP-only cookies with proper JWT tokens including expiry and refresh
3. **Add CSRF Protection**: Implement CSRF tokens for state-changing operations
4. **Rate Limiting**: Add rate limiting to auth endpoints (5 attempts/minute)
5. **Content Security Policy**: Configure strict CSP headers
6. **HTTPS Only**: Enforce HTTPS in production via Vercel
7. **Environment Secrets**: Move all secrets to Vercel environment variables
8. **Input Sanitization**: Add Zod validation schemas to all API routes

### Data Privacy (India DPDP Act Compliance)

1. **User Consent**: Implement consent tracking for data collection and processing
2. **Data Minimization**: Only collect data necessary for platform functionality
3. **Right to Deletion**: Implement user data deletion endpoints
4. **Data Portability**: Allow users to export their data
5. **Encryption**: Encrypt sensitive fields (phone, email) at rest in production

## 3. Performance Optimization

### Frontend Optimizations

1. **Code Splitting**: Next.js automatic route-based code splitting
2. **Lazy Loading**: Components loaded on demand via dynamic imports
3. **Image Optimization**: Next.js Image component with automatic optimization
4. **Bundle Size**: Tree-shaking via ES modules, only import needed icons from lucide-react
5. **Caching**: TanStack Query for server state caching and background refetching

### Backend Optimizations

1. **Database Indexing**: Add indexes on frequently queried fields:
   - `User.email` (unique, already indexed)
   - `Job.status` (for active job queries)
   - `Application.userId` (for user's applications)
   - `TrainingEnrollment.userId` (for user's enrollments)

2. **Query Optimization**: Use `select` and `include` wisely to avoid over-fetching
3. **Connection Pooling**: Prisma handles connection pooling for SQLite

### Recommended Production Optimizations

1. **Redis Caching**: Cache frequently accessed data (job listings, analytics)
2. **CDN**: Serve static assets via Vercel CDN
3. **Database Migration**: Switch to PostgreSQL for concurrent access support
4. **Pagination**: All list endpoints support cursor-based pagination
5. **Compression**: Enable gzip/brotli compression (handled by Vercel)

## 4. Deployment Architecture

### Current: Vercel Deployment

```
GitHub Repository (pmkshar/3boxesjobportal)
         │
         │ Push to main branch
         ▼
    Vercel Build
         │
         ├── Next.js Build (static + serverless)
         ├── API Routes → Serverless Functions
         └── Static Assets → Edge CDN
         │
         ▼
    Vercel Edge Network
         │
         ├── / → Landing Page (SSR)
         ├── /api/* → Serverless Functions
         └── /_next/static/* → CDN Cache
```

### Production Architecture (Recommended)

```
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel      │────▶│  PostgreSQL  │────▶│    Redis     │
│   (Frontend + │     │  (Primary DB)│     │   (Cache)    │
│    API)       │     └──────────────┘     └──────────────┘
└───────┬───────┘              │
        │                      │
        ▼                      ▼
┌───────────────┐     ┌──────────────┐
│  S3/Cloud     │     │  Email       │
│  Storage      │     │  Service     │
│  (Files/PDFs) │     │  (SES/SG)    │
└───────────────┘     └──────────────┘
```

## 5. Technology Decision Rationale

### Why Next.js 16?
- Full-stack framework with SSR and API routes
- Vercel-optimized for instant deployments
- App Router for modern React patterns
- Built-in TypeScript support

### Why Prisma + SQLite?
- Type-safe database queries with auto-generated types
- Schema-first development with migration support
- SQLite for zero-configuration development
- Easy migration to PostgreSQL for production

### Why Zustand over Redux?
- Simpler API with less boilerplate
- Built-in persistence middleware
- TypeScript-first design
- Sufficient for this application's state complexity

### Why shadcn/ui?
- Unstyled, accessible components
- Full ownership of component code
- Consistent with Tailwind CSS design system
- Customizable without fighting framework defaults

## 6. Scalability Considerations

### Horizontal Scaling
1. **Stateless API**: All API routes are stateless (session stored client-side)
2. **Database**: PostgreSQL supports connection pooling and read replicas
3. **File Storage**: Offload to S3/Cloud Storage
4. **Background Jobs**: Use Vercel Cron or external queue (BullMQ) for:
   - Resume PDF generation
   - Email notifications
   - AI skill recalculation
   - Analytics aggregation

### Vertical Scaling
1. **Serverless Functions**: Auto-scale with Vercel
2. **Database**: PostgreSQL with appropriate instance sizing
3. **Caching**: Redis for hot data paths

### Monitoring
1. **Application**: Vercel Analytics + custom AnalyticsEvent tracking
2. **Errors**: Implement Sentry for error tracking
3. **Performance**: Vercel Speed Insights
4. **Uptime**: Uptime Robot or similar monitoring service

## 7. AI Integration Architecture

### Current: Mock AI Implementation
The current AI features use algorithmic logic to simulate AI responses:
- Interview questions are generated from predefined templates based on role/difficulty
- Skill scoring uses weighted algorithms
- Resume AI enhancement uses template-based suggestions

### Future: Real AI Integration (z-ai-web-dev-sdk)
The platform is designed to integrate with the z-ai-web-dev-sdk for:
1. **Real Interview Questions**: AI-generated questions based on job requirements
2. **Response Scoring**: NLP-based analysis of interview responses
3. **Resume Enhancement**: AI-powered resume content generation
4. **Job Matching**: ML-based candidate-job matching
5. **Skill Recommendations**: AI-driven course recommendations

### Integration Points
```typescript
// AI Interview - Backend only (z-ai-web-dev-sdk MUST be server-side)
import { zai } from 'z-ai-web-dev-sdk'

async function generateInterviewQuestions(role: string, difficulty: string) {
  const response = await zai.chat.completions.create({
    model: 'default',
    messages: [
      { role: 'system', content: 'Generate 5 interview questions...' },
      { role: 'user', content: `Role: ${role}, Difficulty: ${difficulty}` }
    ]
  })
  return response.choices[0].message.content
}
```

## 8. Error Handling Strategy

### Client-Side
- Toast notifications for user-facing errors (sonner)
- Error boundaries for React component failures
- Loading states with skeleton components
- Retry mechanisms for failed API calls

### Server-Side
- Try-catch blocks in all API routes
- Structured error responses with HTTP status codes
- Console.error logging for debugging
- Graceful degradation when AI services are unavailable

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "details": "Technical details (dev mode only)",
  "code": "ERROR_CODE"
}
```
