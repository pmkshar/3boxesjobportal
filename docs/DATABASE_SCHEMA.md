# 3 Boxes Jobs - Database Schema Documentation

## Overview

3 Boxes Jobs uses **Prisma ORM** with **SQLite** as the database engine. The schema is defined in `prisma/schema.prisma` and consists of 15 models covering user management, job listings, resumes, applications, interviews, training, skills, analytics, and notifications.

## Entity Relationship Diagram (Text)

```
User (1) ──────< (0..1) JobSeekerProfile
User (1) ──────< (0..1) CorporateProfile
User (1) ──────< (0..1) RecruiterProfile
User (1) ──────< (*) Resume
User (1) ──────< (*) Application
User (1) ──────< (*) Interview
User (1) ──────< (*) TrainingEnrollment
User (1) ──────< (*) AiInterviewSession
User (1) ──────< (*) AnalyticsEvent
User (1) ──────< (*) Notification
User (1) ──────< (*) SavedJob
User (1) ──────< (*) SkillAssessment

CorporateProfile (1) ──────< (*) Job
Job (1) ──────< (*) Application
Job (1) ──────< (*) SavedJob
Resume (1) ──────< (*) Application
TrainingCourse (1) ──────< (*) TrainingEnrollment
```

## Models

### 1. User

The central user model supporting all four roles.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| email | String | @unique | User email (used for login) |
| name | String | | Full name |
| password | String | | SHA-256 hashed password |
| role | UserRole | @default(JOB_SEEKER) | User's role in the system |
| avatar | String? | | Profile avatar URL |
| phone | String? | | Phone number |
| location | String? | | Geographic location |
| bio | String? | | Short biography |
| isActive | Boolean | @default(true) | Account active status |
| emailVerified | Boolean | @default(false) | Email verification status |
| createdAt | DateTime | @default(now()) | Creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Relations:** JobSeekerProfile (1:1), CorporateProfile (1:1), RecruiterProfile (1:1), Resume (1:N), Application (1:N), Interview (1:N), TrainingEnrollment (1:N), AiInterviewSession (1:N), AnalyticsEvent (1:N), Notification (1:N), SavedJob (1:N), SkillAssessment (1:N)

**Enum UserRole:** JOB_SEEKER, CORPORATE, RECRUITER, ADMIN

---

### 2. JobSeekerProfile

Extended profile for job seeker users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | @unique | FK to User |
| headline | String? | | Professional headline |
| experienceYears | Int | @default(0) | Years of experience |
| currentRole | String? | | Current job title |
| currentCompany | String? | | Current employer |
| education | String? | | Education details |
| expectedSalary | String? | | Salary expectation (e.g., "15-20 LPA") |
| jobType | String? | | Preferred type (full-time, part-time, etc.) |
| availability | String? | | Availability (immediate, 2-weeks, 1-month) |
| linkedInUrl | String? | | LinkedIn profile URL |
| portfolioUrl | String? | | Portfolio website URL |
| githubUrl | String? | | GitHub profile URL |
| skills | String? | | Comma-separated skill list |
| aiSkillScore | Float | @default(0) | AI-calculated skill score (0-100) |
| profileComplete | Float | @default(0) | Profile completeness percentage |

---

### 3. CorporateProfile

Extended profile for corporate/employer users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | @unique | FK to User |
| companyName | String | | Company name (required) |
| companyLogo | String? | | Logo URL |
| industry | String? | | Industry sector |
| companySize | String? | | Size range (1-10, 11-50, etc.) |
| website | String? | | Company website URL |
| description | String? | | Company description |
| location | String? | | Company location |
| foundedYear | Int? | | Year founded |
| linkedInUrl | String? | | Company LinkedIn URL |
| isVerified | Boolean | @default(false) | Verification status |

**Relations:** Job (1:N) — all jobs posted by this company

---

### 4. RecruiterProfile

Extended profile for recruiter users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | @unique | FK to User |
| corporateId | String? | | Optional link to CorporateProfile |
| specialization | String? | | Industry specialization |
| yearsExperience | Int | @default(0) | Years of recruiting experience |
| certifications | String? | | Comma-separated certifications |
| placementCount | Int | @default(0) | Total successful placements |
| rating | Float | @default(0) | Average rating (0-5) |

---

### 5. Job

Job postings created by corporate users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| corporateId | String | | FK to CorporateProfile |
| title | String | | Job title |
| description | String | | Full job description |
| requirements | String? | | Required qualifications |
| responsibilities | String? | | Job responsibilities |
| salaryMin | Int? | | Minimum salary (in INR) |
| salaryMax | Int? | | Maximum salary (in INR) |
| salaryCurrency | String | @default("INR") | Currency code |
| jobType | String | @default("full-time") | Employment type |
| experienceMin | Int? | | Minimum years of experience |
| experienceMax | Int? | | Maximum years of experience |
| location | String? | | Job location |
| isRemote | Boolean | @default(false) | Remote work option |
| skills | String? | | Comma-separated required skills |
| benefits | String? | | Benefits description |
| openings | Int | @default(1) | Number of open positions |
| status | JobStatus | @default(DRAFT) | Current job status |
| aiMatchScore | Boolean | @default(false) | AI matching enabled |
| postedDate | DateTime | @default(now()) | Date job was posted |
| closingDate | DateTime? | | Application deadline |

**Enum JobStatus:** DRAFT, ACTIVE, PAUSED, CLOSED, ARCHIVED

**Relations:** CorporateProfile (N:1), Application (1:N), SavedJob (1:N)

---

### 6. Resume

Resume documents created by job seekers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| title | String | | Resume title |
| summary | String? | | Professional summary |
| experience | String? | | JSON array of experience entries |
| education | String? | | JSON array of education entries |
| skills | String? | | JSON array of skill entries |
| certifications | String? | | JSON array of certifications |
| projects | String? | | JSON array of project entries |
| languages | String? | | JSON array of language entries |
| achievements | String? | | JSON array of achievements |
| template | String | @default("professional") | Resume template name |
| isDefault | Boolean | @default(false) | Is this the default resume? |
| aiGenerated | Boolean | @default(false) | Was AI used to generate? |
| lastAiUpdate | DateTime? | | Last AI update timestamp |
| pdfUrl | String? | | Generated PDF URL |

**JSON Field Formats:**

Experience:
```json
[{"company":"TechCorp","role":"Senior Engineer","duration":"2022-Present","description":"Led frontend..."}]
```

Skills:
```json
[{"name":"React","level":"Expert","source":"Experience"}]
```

**Relations:** User (N:1), Application (1:N)

---

### 7. Application

Job applications submitted by job seekers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| jobId | String | | FK to Job |
| userId | String | | FK to User (applicant) |
| resumeId | String? | | FK to Resume (optional) |
| coverLetter | String? | | Cover letter text |
| status | ApplicationStatus | @default(APPLIED) | Current status |
| aiMatchScore | Float? | | AI-calculated match score |
| aiFeedback | String? | | AI feedback on match |
| appliedDate | DateTime | @default(now()) | Date applied |

**Enum ApplicationStatus:** APPLIED, SCREENING, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN

---

### 8. Interview

Interview records for job applications.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| applicationId | String? | | FK to Application (optional) |
| userId | String | | FK to User (interviewee) |
| interviewerId | String? | | FK to User (interviewer) |
| type | InterviewType | @default(VIDEO) | Interview type |
| scheduledAt | DateTime | | Scheduled date/time |
| duration | Int | @default(60) | Duration in minutes |
| status | String | @default("scheduled") | Status |
| meetingLink | String? | | Video meeting URL |
| feedback | String? | | Interviewer feedback |
| rating | Float? | | Interviewer rating |
| aiTranscript | String? | | AI-generated transcript |
| aiFeedback | String? | | AI feedback |

**Enum InterviewType:** PHONE, VIDEO, IN_PERSON, AI_MOCK, TECHNICAL, HR

---

### 9. AiInterviewSession

AI mock interview practice sessions.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| jobRole | String | | Target job role |
| industry | String? | | Target industry |
| difficulty | String | @default("intermediate") | Difficulty level |
| questions | String? | | JSON array of questions |
| responses | String? | | JSON array of user responses |
| scores | String? | | JSON object with category scores |
| overallScore | Float? | | Overall score (0-100) |
| communicationScore | Float? | | Communication subscore |
| technicalScore | Float? | | Technical subscore |
| confidenceScore | Float? | | Confidence subscore |
| aiFeedback | String? | | AI-generated feedback |
| duration | Int? | | Actual duration in seconds |
| completedAt | DateTime? | | Completion timestamp |

---

### 10. TrainingCourse

Available training courses.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier (slug-based for seeds) |
| title | String | | Course title |
| description | String | | Course description |
| category | String | | Category (Programming, Data Science, etc.) |
| level | String | @default("beginner") | Level (beginner, intermediate, advanced) |
| duration | Int | | Duration in hours |
| skills | String? | | Comma-separated skills taught |
| instructor | String? | | Instructor name |
| thumbnailUrl | String? | | Course thumbnail URL |
| videoUrl | String? | | Video content URL |
| isAiGenerated | Boolean | @default(false) | AI-generated content flag |
| rating | Float | @default(0) | Average rating |
| enrollCount | Int | @default(0) | Total enrollments |
| isActive | Boolean | @default(true) | Course availability |

---

### 11. TrainingEnrollment

User enrollments in training courses.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| courseId | String | | FK to TrainingCourse |
| progress | Float | @default(0) | Completion percentage (0-100) |
| status | String | @default("enrolled") | Status (enrolled, in_progress, completed, dropped) |
| score | Float? | | Course score |
| certificate | String? | | Certificate URL |
| skillsAcquired | String? | | JSON array of skills acquired |
| completedAt | DateTime? | | Completion timestamp |

**This is the key model for the AI Skill Auto-Update feature.** When status changes to "completed", the system triggers automatic skill and resume updates.

---

### 12. SkillAssessment

Individual skill level assessments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| skillName | String | | Name of the skill |
| level | Float | @default(0) | Skill level (0-100) |
| source | String | @default("self") | Assessment source (self, training, ai_assessment, interview) |
| evidence | String? | | JSON supporting data |
| assessedAt | DateTime | @default(now()) | Assessment date |

---

### 13. AnalyticsEvent

Event tracking for analytics.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| eventType | String | | Event type (page_view, job_applied, etc.) |
| category | String? | | Event category |
| metadata | String? | | JSON additional data |
| timestamp | DateTime | @default(now()) | Event timestamp |

---

### 14. Notification

User notifications.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| title | String | | Notification title |
| message | String | | Notification body |
| type | String | @default("info") | Type (info, success, warning, error) |
| isRead | Boolean | @default(false) | Read status |
| link | String? | | Navigation link |
| createdAt | DateTime | @default(now()) | Creation timestamp |

---

### 15. SavedJob

Bookmarked/saved jobs by users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId | String | | FK to User |
| jobId | String | | FK to Job |
| createdAt | DateTime | @default(now()) | Save timestamp |

---

## Sample Queries

### Get user with full profile
```typescript
const user = await db.user.findUnique({
  where: { email: 'seeker@3boxes.com' },
  include: {
    jobSeekerProfile: true,
    corporateProfile: true,
    recruiterProfile: true,
  }
})
```

### Get jobs with applications and corporate info
```typescript
const jobs = await db.job.findMany({
  where: { status: 'ACTIVE' },
  include: {
    corporate: true,
    applications: { include: { user: true, resume: true } }
  },
  orderBy: { postedDate: 'desc' },
})
```

### Get user's training enrollments with course data
```typescript
const enrollments = await db.trainingEnrollment.findMany({
  where: { userId: 'user-id-here' },
  include: { course: true },
  orderBy: { createdAt: 'desc' },
})
```

### Get analytics summary
```typescript
const totalApplications = await db.application.count({
  where: { userId: 'user-id-here' }
})
const interviewsCompleted = await db.aiInterviewSession.count({
  where: { userId: 'user-id-here', completedAt: { not: null } }
})
```

### Auto-update skills on training completion
```typescript
// When enrollment status changes to "completed"
const enrollment = await db.trainingEnrollment.update({
  where: { id: 'enrollment-id' },
  data: { status: 'completed', progress: 100, score: 85, completedAt: new Date() }
})

const course = await db.trainingCourse.findUnique({ where: { id: enrollment.courseId } })
const skills = course.skills.split(',').map(s => s.trim())

for (const skill of skills) {
  await db.skillAssessment.upsert({
    where: { id: `${enrollment.userId}-${skill}` },
    update: { level: 75, source: 'training' },
    create: { userId: enrollment.userId, skillName: skill, level: 75, source: 'training' }
  })
}
```
