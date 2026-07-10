# 3 Boxes Jobs - API Reference

## Base URL
```
Development: http://localhost:3000
Production: https://3boxesjobportal.vercel.app
```

## Authentication
All authenticated endpoints require a valid token. Currently, the token is passed via the Zustand store on the client side. For API-only access, include the token in future Authorization headers.

---

## 1. Auth Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securepassword",
  "role": "JOB_SEEKER",
  "companyName": "Optional for CORPORATE",
  "industry": "Optional for CORPORATE",
  "companySize": "Optional for CORPORATE",
  "specialization": "Optional for RECRUITER",
  "phone": "+91-9876543210",
  "location": "Mumbai, India"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clx...",
    "email": "rahul@example.com",
    "name": "Rahul Sharma",
    "role": "JOB_SEEKER",
    "avatar": null,
    "phone": "+91-9876543210",
    "location": "Mumbai, India"
  },
  "message": "Registration successful"
}
```

**Error (409):**
```json
{ "error": "Email already registered" }
```

---

### POST /api/auth/login
Authenticate a user and get a token.

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
    "id": "clx...",
    "email": "seeker@3boxes.com",
    "name": "Rahul Sharma",
    "role": "JOB_SEEKER",
    "avatar": null,
    "phone": "+91-9876543210",
    "location": "Mumbai, India",
    "profile": { ... }
  },
  "token": "a1b2c3d4..."
}
```

**Error (401):**
```json
{ "error": "Invalid email or password" }
```

---

### GET /api/auth/me
Get current user profile with role-specific data.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "user": { ... },
  "jobSeekerProfile": { ... },
  "corporateProfile": { ... },
  "recruiterProfile": { ... }
}
```

---

## 2. Jobs Endpoints

### GET /api/jobs
Search and list jobs with pagination.

**Query Parameters:**
- `search` (optional): Search term for title/skills
- `jobType` (optional): Filter by type (full-time, part-time, contract, remote)
- `isRemote` (optional): Filter remote jobs (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 9)

**Response (200):**
```json
{
  "jobs": [
    {
      "id": "clx...",
      "title": "Senior React Developer",
      "description": "...",
      "requirements": "...",
      "salaryMin": 1200000,
      "salaryMax": 2000000,
      "jobType": "full-time",
      "location": "Bangalore, India",
      "isRemote": true,
      "skills": "React, TypeScript, GraphQL, Redux",
      "status": "ACTIVE",
      "postedDate": "2024-01-15T00:00:00.000Z",
      "corporate": {
        "id": "clx...",
        "companyName": "Priya Technologies Pvt Ltd"
      },
      "applications": [...]
    }
  ],
  "totalPages": 3,
  "currentPage": 1
}
```

---

### GET /api/jobs/[id]
Get a single job by ID.

**Response (200):** Single job object with corporate and applications.

---

### POST /api/jobs
Create a new job posting (Corporate only).

**Request Body:**
```json
{
  "corporateId": "clx...",
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "requirements": "5+ years React...",
  "responsibilities": "Build UI components...",
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
  "closingDate": "2024-06-30"
}
```

**Response (201):** Created job object.

---

## 3. Applications Endpoints

### POST /api/applications
Submit a job application (Job Seeker only).

**Request Body:**
```json
{
  "jobId": "clx...",
  "userId": "clx...",
  "resumeId": "clx..." (optional),
  "coverLetter": "I am writing to apply..." (optional)
}
```

**Response (201):**
```json
{
  "application": { ... },
  "aiMatchScore": 85
}
```

---

### GET /api/applications
Get applications for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "applications": [
    {
      "id": "clx...",
      "status": "APPLIED",
      "aiMatchScore": 85,
      "appliedDate": "2024-01-20T00:00:00.000Z",
      "job": { ... },
      "user": { ... },
      "resume": { ... }
    }
  ]
}
```

---

### PUT /api/applications
Update application status (Corporate/Recruiter).

**Request Body:**
```json
{
  "id": "clx...",
  "status": "SHORTLISTED"
}
```

**Valid Status Values:**
APPLIED, SCREENING, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN

---

## 4. Resume Endpoints

### GET /api/resumes
Get all resumes for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "resumes": [
    {
      "id": "clx...",
      "title": "My Resume",
      "summary": "...",
      "experience": "[{...}]",
      "skills": "[{...}]",
      "template": "professional",
      "isDefault": true,
      "aiGenerated": false,
      "lastAiUpdate": null
    }
  ]
}
```

---

### POST /api/resumes
Create a new resume.

**Request Body:**
```json
{
  "userId": "clx...",
  "title": "My Resume",
  "summary": "Professional summary...",
  "experience": [{"company":"...","role":"...","duration":"...","description":"..."}],
  "education": [{"institution":"...","degree":"...","year":"..."}],
  "skills": [{"name":"React","level":"Expert","source":"Experience"}],
  "certifications": [{"name":"AWS SA","year":"2023","issuer":"AWS"}],
  "projects": [{"name":"...","description":"...","link":"..."}],
  "languages": [{"name":"English","proficiency":"Professional"}],
  "achievements": ["Won hackathon..."],
  "template": "professional"
}
```

---

### PUT /api/resumes
Update a resume or trigger AI enhancement.

**Request Body:**
```json
{
  "id": "clx...",
  "summary": "Updated summary...",
  "aiEnhance": true
}
```

When `aiEnhance: true`, the API triggers AI content enhancement for the resume sections.

---

## 5. AI Interview Endpoints

### POST /api/ai-interview
Start a new AI mock interview session.

**Request Body:**
```json
{
  "userId": "clx...",
  "jobRole": "Software Engineer",
  "industry": "IT",
  "difficulty": "intermediate"
}
```

**Response (201):**
```json
{
  "session": {
    "id": "clx...",
    "jobRole": "Software Engineer",
    "difficulty": "intermediate",
    "createdAt": "..."
  },
  "questions": [
    {
      "id": 1,
      "category": "General",
      "question": "Tell me about yourself and your experience...",
      "timeLimit": 120
    },
    ...
  ]
}
```

---

### PUT /api/ai-interview
Submit interview responses and get scores.

**Request Body:**
```json
{
  "sessionId": "clx...",
  "responses": [
    {
      "questionId": 1,
      "text": "I am a software engineer with 5 years...",
      "question": "Tell me about yourself..."
    },
    ...
  ]
}
```

**Response (200):**
```json
{
  "session": {
    "id": "clx...",
    "overallScore": 75,
    "communicationScore": 80,
    "technicalScore": 72,
    "confidenceScore": 70,
    "aiFeedback": "Good communication skills. Consider adding more specific technical details...",
    "completedAt": "..."
  }
}
```

---

### GET /api/ai-interview
Get interview history for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "clx...",
      "jobRole": "Software Engineer",
      "difficulty": "intermediate",
      "overallScore": 75,
      "completedAt": "...",
      "createdAt": "..."
    }
  ]
}
```

---

## 6. Training Endpoints

### GET /api/training
Get training courses with optional filters.

**Query Parameters:**
- `userId` (optional): Include enrollment data for this user
- `category` (optional): Filter by category

**Response (200):**
```json
{
  "courses": [
    {
      "id": "react-advanced-patterns-performance",
      "title": "React Advanced Patterns & Performance",
      "description": "...",
      "category": "Programming",
      "level": "advanced",
      "duration": 24,
      "skills": "React, TypeScript, Redux Toolkit",
      "rating": 4.9,
      "enrollCount": 2500,
      "enrollments": [
        {
          "id": "clx...",
          "progress": 50,
          "status": "in_progress"
        }
      ]
    }
  ]
}
```

---

### POST /api/training
Enroll in a training course.

**Request Body:**
```json
{
  "userId": "clx...",
  "courseId": "react-advanced-patterns-performance"
}
```

**Response (201):** Enrollment object with initial progress=0, status="enrolled".

---

### PUT /api/training
Update training progress or complete a course. **This is the core AI Skill Auto-Update trigger.**

**Request Body:**
```json
{
  "enrollmentId": "clx...",
  "progress": 100,
  "status": "completed",
  "score": 85,
  "skillsAcquired": ["React", "TypeScript", "Redux Toolkit"]
}
```

**Response (200):**
```json
{
  "enrollment": { ... },
  "skillsUpdated": 3,
  "resumesUpdated": 2,
  "message": "Course completed! Skills and resume auto-updated."
}
```

**Side Effects:**
1. Creates/updates `SkillAssessment` records for each acquired skill
2. Updates `JobSeekerProfile.skills` with new skills
3. Updates all active `Resume` records' skills sections
4. Sets `Resume.lastAiUpdate` to current timestamp
5. Creates `Notification` for the user

---

## 7. Skills Endpoints

### GET /api/skills
Get skill assessments for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "assessments": [
    {
      "id": "clx...",
      "skillName": "React",
      "level": 85,
      "source": "training",
      "assessedAt": "..."
    }
  ]
}
```

---

## 8. Analytics Endpoints

### GET /api/analytics
Get analytics data for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "summary": {
    "totalApplications": 5,
    "interviewsCompleted": 3,
    "trainingsCompleted": 2,
    "profileStrength": 85,
    "avgInterviewScore": 75,
    "skillsCount": 12,
    "resumeCount": 1
  },
  "applicationByStatus": [
    { "status": "APPLIED", "count": 3 },
    { "status": "SHORTLISTED", "count": 2 }
  ],
  "skillDistribution": {
    "React": 85,
    "TypeScript": 78
  },
  "interviewSessions": [...],
  "skillAssessments": [...],
  "monthlyActivity": {
    "2024-01": 5,
    "2024-02": 3
  }
}
```

---

## 9. Notifications Endpoints

### GET /api/notifications
Get notifications for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response (200):**
```json
{
  "notifications": [...],
  "unreadCount": 2
}
```

---

## 10. Seed Endpoint

### POST /api/seed
Seed the database with demo data. Safe to call multiple times (uses upsert).

**Response (200):**
```json
{
  "message": "Seed data created successfully",
  "users": {
    "jobSeeker": { "email": "seeker@3boxes.com", "password": "demo123" },
    "corporate": { "email": "corp@3boxes.com", "password": "demo123" },
    "recruiter": { "email": "recruiter@3boxes.com", "password": "demo123" },
    "admin": { "email": "admin@3boxes.com", "password": "demo123" }
  }
}
```

---

## Error Codes Reference

| Status Code | Meaning | Common Scenarios |
|-------------|---------|------------------|
| 400 | Bad Request | Missing required fields, invalid data format |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Account deactivated, insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate email, already enrolled |
| 500 | Internal Server Error | Database error, unexpected failure |
