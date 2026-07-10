# 3 Boxes Jobs — Standard Operating Procedures (SOPs)

## SOP-001: User Registration & Onboarding

### Purpose
Define the standard process for new user registration and onboarding across all three user roles (Job Seeker, Corporate, Recruiter).

### Scope
Applies to all new users registering on the 3 Boxes Jobs platform.

### Procedure

#### 1. Job Seeker Registration

1. User navigates to the 3 Boxes Jobs homepage
2. Clicks "Get Started" or "Start as Job Seeker" button
3. Auth dialog opens on the "Register" tab
4. Selects "Job Seeker" role card (default selection)
5. Fills in required fields:
   - **Full Name** (required): Enter real name as it should appear on resume
   - **Email** (required): Must be unique, used for login
   - **Password** (required): Minimum 6 characters
6. Clicks "Create Account"
7. System creates:
   - User record with hashed password (SHA-256)
   - JobSeekerProfile with default headline "Looking for new opportunities"
   - Welcome notification
8. User is automatically switched to the Login tab
9. Demo credentials are pre-filled for quick access
10. User logs in and is redirected to Job Seeker Dashboard
11. **Recommended Next Steps** (shown as AI insights):
    - Complete profile (add skills, experience, education)
    - Build resume using AI Resume Builder
    - Take first AI Mock Interview
    - Enroll in relevant training courses

#### 2. Corporate Registration

1. User clicks "Post as Employer" or selects "Corporate" in registration
2. Fills in required fields:
   - **Full Name** (required): Contact person's name
   - **Email** (required): Corporate email preferred
   - **Password** (required): Minimum 6 characters
   - **Company Name** (required): Legal entity name
   - **Industry** (optional): Select from dropdown (IT, Finance, Healthcare, etc.)
   - **Company Size** (optional): Select from dropdown (1-10, 11-50, etc.)
3. System creates:
   - User record with CORPORATE role
   - CorporateProfile with company details
   - `isVerified` defaults to `false`
4. User logs in and is redirected to Corporate Dashboard
5. **Recommended Next Steps**:
   - Complete company profile (website, description, location, logo)
   - Post first job opening
   - Review applications when received

#### 3. Recruiter Registration

1. User selects "Recruiter" role in registration
2. Fills in required fields:
   - **Full Name** (required)
   - **Email** (required)
   - **Password** (required)
   - **Specialization** (optional): Select from dropdown (IT, Finance, Healthcare, Marketing, General)
3. System creates:
   - User record with RECRUITER role
   - RecruiterProfile with specialization
   - `placementCount` defaults to 0
   - `rating` defaults to 0
4. User logs in and is redirected to Recruiter Dashboard
5. **Recommended Next Steps**:
   - Complete recruiter profile
   - Search for candidates
   - Set up pipeline

### Quality Checks
- Email uniqueness is enforced at database level
- Password is hashed before storage (never stored in plaintext)
- Profile auto-creation ensures dashboard access works immediately
- Welcome notification is sent to guide new users

---

## SOP-002: Job Posting & Management

### Purpose
Define the standard process for corporate users to create, manage, and close job postings.

### Scope
Applies to corporate users with active accounts on the platform.

### Procedure

#### 1. Creating a New Job Posting

1. Navigate to Corporate Dashboard → "Post Job" in sidebar
2. Fill in the job creation form:
   - **Title** (required): Clear, specific job title (e.g., "Senior React Developer")
   - **Description** (required): Detailed role description including team context, project scope, and impact
   - **Requirements** (optional): Must-have skills and qualifications
   - **Responsibilities** (optional): Day-to-day tasks and deliverables
   - **Min Salary / Max Salary** (optional): In Lakhs Per Annum (LPA), converted to absolute values internally
   - **Job Type**: Select from full-time, part-time, contract, remote
   - **Min Experience / Max Experience** (optional): In years
   - **Location** (optional): City, Country format (e.g., "Bangalore, India")
   - **Required Skills** (optional): Comma-separated (e.g., "React, TypeScript, Node.js")
   - **Benefits** (optional): Comma-separated (e.g., "Health insurance, Stock options")
   - **Remote Friendly** (optional): Checkbox toggle
   - **Number of Openings** (optional): Default is 1
3. Click "Post Job"
4. System automatically:
   - Sets status to `ACTIVE`
   - Records `postedDate` as current timestamp
   - Makes job visible in candidate search results
5. Confirmation toast appears: "Job posted successfully!"

#### 2. Managing Active Jobs

1. Navigate to "My Jobs" in sidebar
2. View list of all posted jobs with:
   - Title and location
   - Application count
   - Status badge (DRAFT, ACTIVE, PAUSED, CLOSED, ARCHIVED)
3. To change job status, use the job detail view

#### 3. Reviewing Applications

1. Navigate to "Applications" in sidebar
2. View all applications across posted jobs
3. Each application shows:
   - Candidate name
   - AI Match Score (percentage)
   - Current application status
4. Action buttons:
   - **Shortlist** (green checkmark): Changes status to SHORTLISTED
   - **Reject** (red X): Changes status to REJECTED
5. Status changes automatically:
   - Create notification for the candidate
   - Record analytics event

### Quality Checks
- Job title and description are mandatory (enforced at API level)
- Corporate ID is automatically resolved from user profile
- Salary values are properly converted from LPA to absolute amounts
- AI matching starts working as soon as job is ACTIVE

---

## SOP-003: Job Application Process

### Purpose
Define the standard process for job seekers to search, apply, and track job applications.

### Scope
Applies to all job seeker users on the platform.

### Procedure

#### 1. Searching for Jobs

1. Navigate to Job Seeker Dashboard → "Find Jobs" in sidebar
2. Use search bar to search by job title, skill, or company name
3. Apply filters:
   - **Job Type**: Full-time, Part-time, Contract, Remote
   - **Remote Friendly**: Toggle button for remote-only jobs
4. Click "Search" or press Enter
5. Browse job cards showing:
   - Job title and company name
   - Location and job type
   - Required skills (up to 4 shown, "+N" for more)
   - Salary range (formatted in Indian currency notation)
   - Posted date
6. Click on any job card to view full details

#### 2. Viewing Job Details & Applying

1. Click job card to open detail dialog
2. Review full information:
   - Complete description and requirements
   - All required skills
   - Benefits package
   - Salary range and experience requirements
3. Click "Apply Now" button
4. System automatically:
   - Checks for duplicate application (prevents double-apply)
   - Calculates AI Match Score based on skill overlap
   - Creates application record with APPLIED status
   - Records analytics event
   - Sends notification to job seeker
5. Confirmation toast with AI Match Score appears

#### 3. Tracking Applications

1. Navigate to "Applications" in sidebar
2. View all applications with status badges
3. Filter by status:
   - APPLIED (blue)
   - SCREENING (yellow)
   - SHORTLISTED (purple)
   - INTERVIEWED (cyan)
   - OFFERED (green)
   - REJECTED (red)
4. Each application card shows:
   - Job title and company name
   - Applied date
   - AI Match Score
   - AI Feedback text
   - Current status

### AI Match Score Calculation
1. Job required skills are extracted and normalized to lowercase
2. Candidate profile skills are extracted and normalized to lowercase
3. For each job skill, check if candidate has a matching or containing skill
4. Score = (matched / total required) × 100
5. Feedback generated based on score range

---

## SOP-004: AI Resume Builder

### Purpose
Define the standard process for creating, editing, and auto-updating resumes using the AI-powered resume builder.

### Scope
Applies to job seeker users building and managing their resumes.

### Procedure

#### 1. Creating a New Resume

1. Navigate to "Resume Builder" in sidebar
2. Click "Create New Resume" button (if no existing resumes) or "+" button
3. Fill in resume sections:
   - **Title**: Resume name (e.g., "Rahul Sharma - Software Engineer")
   - **Professional Summary**: Brief career overview
   - **Experience**: Add multiple entries with company, role, duration, description
   - **Education**: Add entries with institution, degree, year, grade
   - **Skills**: Add entries with name, level (Beginner/Intermediate/Advanced/Expert), source
   - **Certifications**: Add entries with name, year, issuer
   - **Projects**: Add entries with name, description, link
   - **Languages**: Add entries with name, proficiency
   - **Achievements**: Add free-text achievement entries
4. Select template: Professional, Modern, Creative, or Minimal
5. Set as default resume (optional, recommended)
6. Click "Save Resume"

#### 2. AI-Powered Features

**AI Enhance Summary:**
1. Click "AI Enhance" button next to the summary field
2. System generates a professionally written summary based on:
   - Existing skills and experience
   - Career level and role
   - Industry best practices
3. Review and accept the enhanced summary

**AI Suggest Skills:**
1. Click "AI Suggest Skills" button in the skills section
2. System recommends skills based on:
   - Current skill set
   - Market demand trends
   - Role-appropriate skills
3. Select desired suggestions to add to resume

#### 3. Resume Auto-Update (Triggered by Training Completion)

When a training course is completed, the system automatically:
1. Adds new skills to the resume's Skills section with source "Training"
2. Updates the "AI Updated" badge with timestamp
3. Sends notification about the auto-update
4. No manual action required from the user

#### 4. Managing Multiple Resumes

1. Users can create multiple resumes for different job types
2. Only one resume can be the "default" at a time
3. Setting a new default automatically unsets the previous default
4. Default resume is used for auto-updates and job applications
5. Each resume can use a different template

---

## SOP-005: AI Mock Interview

### Purpose
Define the standard process for conducting AI-powered mock interviews for interview preparation.

### Scope
Applies to job seeker users practicing interview skills.

### Procedure

#### 1. Starting an Interview

1. Navigate to "AI Interview" in sidebar
2. Select interview parameters:
   - **Job Role** (required): Choose target role from dropdown
     - Software Engineer, Data Scientist, Product Manager, UI/UX Designer, Marketing Manager, DevOps Engineer
   - **Industry** (optional): Select industry context
     - IT, Finance, Healthcare, E-commerce, Startup
   - **Difficulty Level**: Select from three options
     - Beginner: 5 questions (recommended for first-time users)
     - Intermediate: 7 questions (default, most common)
     - Advanced: 10 questions (for experienced professionals)
3. Click "Start Interview"
4. System generates role-specific questions and creates session record

#### 2. During the Interview

1. Questions appear one at a time with:
   - Question text
   - Category badge (technical, behavioral)
   - Question number and total count (e.g., "Question 3 of 7")
   - Countdown timer (120s for technical, 90s for behavioral)
2. Type response in the text area
3. Word count is displayed in real-time
4. Navigation options:
   - "Previous" button to review/edit earlier responses
   - "Next Question" button to proceed
   - Timer auto-advances when time runs out
5. Progress bar shows overall completion

#### 3. Completing the Interview

1. After answering all questions, click "Finish Interview"
2. System calculates scores:
   - **Communication Score** (0-100): Based on response length and structure
   - **Technical Score** (0-100): Based on technical keyword usage
   - **Confidence Score** (0-100): Based on assertive language usage
   - **Overall Score** (0-100): Weighted average (30% + 40% + 30%)
3. Results page displays:
   - Large overall score with color coding (green ≥70, amber ≥50, red <50)
   - Three category scores with icons
   - Detailed AI feedback with improvement suggestions
4. Action options:
   - "Practice Again" → Return to setup
   - "View History" → See all past interviews

#### 4. Reviewing Interview History

1. Click "View Past Interviews" or navigate to History tab
2. View list of all past sessions with:
   - Job role and difficulty
   - Date conducted
   - Overall score (with color-coded badge)
   - Completion status
3. Track improvement over time through Analytics dashboard

#### 5. Post-Interview Updates

If overall score exceeds 60%:
- System creates a SkillAssessment record with source "ai_assessment"
- Analytics event recorded as "interview_completed"
- Score data available in Analytics dashboard for trend tracking

---

## SOP-006: Training & Skill Auto-Update

### Purpose
Define the standard process for enrolling in training courses and the automatic skill update mechanism.

### Scope
Applies to job seeker users taking training courses for skill development.

### Procedure

#### 1. Browsing Training Courses

1. Navigate to "Training Hub" in sidebar
2. View course catalog with cards showing:
   - Course title and description
   - Category badge (Programming, Data Science, Cloud Computing, Marketing, Product, Design)
   - Duration (in hours)
   - Rating (out of 5 stars)
   - Enrollment count
   - Skills to be acquired (up to 3 shown)
3. Filter by category using dropdown:
   - All Categories, Programming, Data Science, Cloud Computing, Marketing, Product, Design
4. Note the AI Skill Auto-Update notice at the top of the page

#### 2. Enrolling in a Course

1. Click "Enroll Free" button on desired course card
2. System creates TrainingEnrollment record:
   - Status: "enrolled"
   - Progress: 0%
3. Course card updates to show:
   - Progress bar (0%)
   - "Continue" button replaces "Enroll Free"
4. Course enrollment count increments by 1

#### 3. Tracking Progress & Completing Courses

1. While enrolled, track progress percentage on the course card
2. To complete a course (for demo purposes, available immediately):
   - Click "Complete Course" button (available when progress ≥ 80%)
   - Or click "Continue" to simulate progress
3. System executes the **Skill Auto-Update Cascade**:

**Auto-Update Step-by-Step:**

| Step | Action | Target | Details |
|------|--------|--------|---------|
| 1 | Update JobSeekerProfile.skills | Profile | Append new skills, deduplicated |
| 2 | Increment aiSkillScore | Profile | +5 points per completion |
| 3 | Update Resume.skills | Default Resume | Add entries with source "Training" |
| 4 | Set Resume.lastAiUpdate | Default Resume | Current timestamp |
| 5 | Create SkillAssessment records | Assessments | One per skill, level=60, source="training" |
| 6 | Create AnalyticsEvent | Analytics | eventType="training_completed" |
| 7 | Create Notification | Notifications | "Skills Updated" success message |

4. User sees:
   - Success toast: "Course completed! Your skills and resume have been auto-updated!"
   - Course card shows "Completed" badge
   - Skills appear in Profile view
   - Skills appear in Resume Builder
   - Analytics dashboard reflects new data

#### 4. Verifying Skill Auto-Update

After completing a training course, verify the auto-update by:
1. Navigate to "Profile" → Check skills section for new entries
2. Navigate to "Resume Builder" → Check skills section for new entries with "Training" source
3. Navigate to "Analytics" → Check skill assessment levels chart for new entries
4. Check notification bell for "Skills Updated" notification

---

## SOP-007: AI Analytics Dashboard

### Purpose
Define the standard process for using the AI analytics dashboard to track career progress and receive AI-driven insights.

### Scope
Applies to all authenticated users with analytics access.

### Procedure

#### 1. Accessing the Dashboard

1. Navigate to "Analytics" in sidebar (available for all roles)
2. Dashboard loads with data from the analytics API
3. Loading spinner appears while data is being fetched

#### 2. Reading Summary Metrics

The dashboard displays 8 key metric cards:
- **Applications**: Total job applications submitted
- **Interviews**: Number of AI mock interviews completed
- **Trainings**: Training courses completed
- **Profile Strength**: Calculated percentage (20% base + bonuses)
- **AI Interview Score**: Average across all interview sessions
- **Skills Count**: Number of skill assessments recorded
- **Resumes**: Number of resumes created
- **Avg Match Score**: Average AI job match percentage

#### 3. Interpreting Charts

**Application Status Distribution (Pie Chart):**
- Shows breakdown of applications by status
- Hover for exact counts
- Legend below chart with status names

**Skill Assessment Levels (Bar Chart):**
- Shows skill names on X-axis
- Assessment levels (0-100) on Y-axis
- Higher bars indicate stronger skills

**Recent Activity (Line Chart):**
- Shows platform activity over time
- Date on X-axis, event count on Y-axis
- Useful for tracking engagement patterns

**Interview Score Trends (Multi-Line Chart):**
- Shows interview scores over time
- Solid line: Overall score
- Dashed lines: Communication and Technical subscores
- Track improvement across sessions

**Skill Radar (Radar Chart):**
- Shows top 6 skills in a spider/radar format
- Visual representation of skill distribution
- Useful for identifying strengths and gaps

#### 4. AI Career Insights

The bottom section provides AI-generated recommendations:
- Profile improvement suggestions (e.g., "Complete your profile to increase visibility by 80%")
- Training recommendations (e.g., "Take System Design course to match 40% more jobs")
- Skill gap analysis (e.g., "Add AWS skills — 65% of jobs require it")
- Application strategy tips (e.g., "Apply to 5+ jobs per week for 3x higher success")

#### 5. Profile Strength Calculation

| Factor | Points | Condition |
|--------|--------|-----------|
| Base score | 20 | Always |
| Has headline | +10 | JobSeekerProfile.headline is not null |
| Has skills | +15 | JobSeekerProfile.skills is not null |
| Has current role | +10 | JobSeekerProfile.currentRole is not null |
| Has education | +10 | JobSeekerProfile.education is not null |
| Has LinkedIn | +5 | JobSeekerProfile.linkedInUrl is not null |
| Has resume | +15 | At least 1 Resume exists |
| Has 5+ skills | +15 | SkillAssessment count > 5 |
| **Maximum** | **100** | |

---

## SOP-008: Notification Management

### Purpose
Define the standard process for system notifications and how users interact with them.

### Scope
Applies to all authenticated users receiving system notifications.

### Procedure

#### 1. Viewing Notifications

1. Click the bell icon in the top navigation bar
2. Unread notification count appears as a red badge on the bell icon
3. Notifications are generated automatically by the system for:
   - Application submitted
   - Application status updated (shortlisted, rejected, offered, etc.)
   - Training completed / skills auto-updated
   - Welcome message on registration
   - AI skill assessment available

#### 2. Notification Types

| Type | Color | Use Case |
|------|-------|----------|
| info | Blue | General information, tips |
| success | Green | Positive actions completed |
| warning | Yellow | Important alerts |
| error | Red | Failed operations |

#### 3. Marking as Read

- Individual: Click on a notification to mark it as read
- Bulk: Use "Mark All as Read" option to clear all unread notifications

---

## SOP-009: System Administration & Data Management

### Purpose
Define the standard process for system administration tasks including data seeding and maintenance.

### Scope
Applies to system administrators and developers managing the platform.

### Procedure

#### 1. Database Seeding

```bash
# Seed the database with demo data
curl -X POST http://localhost:3000/api/seed
```

The seed creates:
- 4 demo users (Job Seeker, Corporate, Recruiter, Admin)
- 5 job postings (React, Data Science, DevOps, Product, UX)
- 8 training courses across categories
- 1 demo resume with full sections
- 10 skill assessments
- 3 notifications

**Note**: The seed uses upsert for users (idempotent), but creates new records for jobs, courses, etc. each time. Run only once for a fresh database.

#### 2. Database Reset

```bash
# Reset and re-push the schema
bun run db:push

# Re-seed after reset
curl -X POST http://localhost:3000/api/seed
```

#### 3. Production Maintenance Checklist

- [ ] Monitor database size (SQLite has practical limits)
- [ ] Review and clean up old analytics events (monthly)
- [ ] Archive closed job postings (quarterly)
- [ ] Review inactive user accounts (quarterly)
- [ ] Update training course catalog (monthly)
- [ ] Review AI scoring thresholds (quarterly)
- [ ] Backup database (daily)

---

## SOP-010: Deployment & Release Process

### Purpose
Define the standard process for deploying the 3 Boxes Jobs application to production via Vercel.

### Scope
Applies to developers and DevOps personnel responsible for deployment.

### Procedure

#### 1. Pre-Deployment Checklist

- [ ] All code changes merged to main branch
- [ ] Linter passes: `bun run lint`
- [ ] No TypeScript errors
- [ ] All API endpoints tested
- [ ] Demo accounts verified
- [ ] Environment variables configured in Vercel
- [ ] Database migration scripts prepared (if schema changed)
- [ ] Documentation updated

#### 2. Deployment Steps

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Deploy to Vercel preview
vercel

# 3. Test preview deployment
# Visit the preview URL and run smoke tests

# 4. Deploy to production
vercel --prod
```

#### 3. Post-Deployment Verification

- [ ] Landing page loads correctly
- [ ] Login with demo accounts works
- [ ] Job search returns results
- [ ] AI Interview starts and completes
- [ ] Training enrollment and completion work
- [ ] Skill auto-update triggers correctly
- [ ] Analytics dashboard displays charts
- [ ] Notifications appear and can be marked read

#### 4. Rollback Procedure

If issues are found in production:
1. Identify the last working deployment in Vercel dashboard
2. Click "Promote to Production" on the previous deployment
3. Investigate and fix the issue in development
4. Deploy the fix through the normal process

---

## SOP-011: Error Handling & Troubleshooting

### Purpose
Define standard procedures for handling common errors and troubleshooting issues.

### Scope
Applies to all users and administrators of the 3 Boxes Jobs platform.

### Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Login fails with valid credentials | Password case sensitivity | Check caps lock, passwords are case-sensitive |
| "Email already registered" | Duplicate registration attempt | Login with existing account or use different email |
| Job search returns no results | No active jobs in database | Run seed API to populate demo data |
| AI Interview won't start | Missing job role selection | Select a job role from the dropdown |
| Skills not auto-updating | Training not marked complete | Complete the training course properly |
| Charts not displaying | No analytics data | Use the platform more to generate data |
| Page appears blank | JavaScript error | Check browser console, clear cache |
| "Already applied" error | Duplicate application | Check applications list, apply to different job |
| Corporate dashboard empty | No corporate profile | Ensure registration included company name |
| Profile strength stuck | Incomplete profile | Add more details (headline, skills, education, links) |

### API Error Response Format

All API errors follow a consistent format:
```json
{
  "error": "Human-readable error message",
  "details": "Additional context (only in 500 errors)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid input)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (account deactivated)
- `404` - Not Found
- `409` - Conflict (duplicate, already exists)
- `500` - Internal Server Error

---

## SOP-012: GitHub Repository Management

### Purpose
Define the standard process for managing the GitHub repository including branching, commits, and pull requests.

### Scope
Applies to all developers contributing to the 3 Boxes Jobs repository.

### Repository

**URL**: https://github.com/pmkshar/3boxesjobportal

### Branching Strategy

```
main (production-ready)
├── develop (integration branch)
│   ├── feature/ai-interview-improvements
│   ├── feature/resume-pdf-export
│   ├── fix/application-duplicate-check
│   └── feature/new-analytics-charts
```

### Commit Convention

```
feat: Add AI skill recommendation engine
fix: Resolve duplicate application submission bug
docs: Update API reference documentation
style: Format resume builder component
refactor: Optimize analytics query performance
test: Add integration tests for training API
chore: Update dependencies to latest versions
```

### Procedure

1. **Create Feature Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop & Commit**:
   ```bash
   git add .
   git commit -m "feat: add skill recommendation based on job market"
   ```

3. **Push & Create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

4. **Code Review**: At least one reviewer must approve before merge

5. **Merge to Develop**: After approval, merge PR to develop branch

6. **Release to Main**: When develop is stable, merge to main for production deployment
