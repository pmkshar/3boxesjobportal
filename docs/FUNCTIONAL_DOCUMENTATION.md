# 3 Boxes Jobs — Functional Documentation

## 1. Functional Overview

3 Boxes Jobs is a comprehensive AI-powered job portal that serves three primary user personas: Job Seekers, Corporates (Employers), and Recruiters. The platform leverages artificial intelligence throughout the hiring lifecycle to improve matching accuracy, automate skill updates, and provide actionable insights.

## 2. User Personas & Workflows

### 2.1 Job Seeker

**Primary Goal**: Find and secure employment through AI-assisted tools.

**Registration Flow**:
1. Visit 3boxesjobportal.com
2. Click "Get Started" → Select "Job Seeker" role
3. Fill in name, email, password
4. Profile auto-created with default fields
5. Redirected to Job Seeker Dashboard

**Core Workflows**:

#### Profile Management
- Edit professional headline, current role, company, experience years
- Add/remove skills (comma-separated tags)
- Set expected salary, job type preference, availability
- Add education, social links (LinkedIn, GitHub, Portfolio)
- System calculates profile completeness percentage
- AI Skill Score displayed based on assessments

#### Job Search & Application
- Search jobs by title, skills, location, company
- Filter by job type (full-time, part-time, contract, remote)
- Filter by remote-friendly toggle
- View job cards with: title, company, location, salary range, skill tags
- Click to expand full job details in dialog
- Apply with single click — system auto-calculates AI Match Score
- AI provides feedback on match quality
- Track all applications in Applications view with status timeline
- Filter applications by status

#### AI Resume Builder
- Create multiple resumes with different templates
- Sections: Summary, Experience, Education, Skills, Certifications, Projects, Languages, Achievements
- Dynamic add/remove entries in each section
- **AI Enhance Summary**: Generates professional summary text
- **AI Suggest Skills**: Recommends skills based on market trends
- **Skill Auto-Update**: When training courses are completed, skills automatically appear in resume
- Live preview panel showing formatted resume
- Template selector (Professional, Modern, Creative, Minimal)
- AI Updated badge with timestamp when resume was last auto-updated
- PDF download capability

#### AI Mock Interview
- Select target job role from dropdown
- Select industry (optional) and difficulty level
- Start interview session with generated questions
- Timed responses (90-120 seconds per question)
- Progress bar showing question count
- Submit all responses for AI scoring
- Results show: Overall Score, Communication Score, Technical Score, Confidence Score
- Detailed AI Feedback with improvement suggestions
- Interview History with all past sessions and scores

#### Training Hub
- Browse course catalog with category filters
- 8+ courses across: Programming, Data Science, Cloud Computing, Marketing, Product, Design
- Course cards show: title, instructor, duration, rating, enrollment count, skill tags
- Enroll in courses with single click
- Track progress with progress bar
- **Complete Course**: Mark as complete → Skills auto-added to profile AND resume
- AI Skill Auto-Update notification on completion
- Celebration feedback on course completion

#### AI Analytics Dashboard
- Summary metrics: Applications, Interviews, Trainings, Profile Strength, AI Score, Skills Count
- Application Status Distribution (Pie Chart)
- Skill Assessment Levels (Bar Chart)
- Recent Activity (Line Chart)
- Interview Score Trends (Multi-line Chart)
- Skill Radar Chart (Radar Chart)
- AI Career Insights: Personalized recommendations based on data analysis

### 2.2 Corporate (Employer)

**Primary Goal**: Post job openings and find qualified candidates efficiently.

**Registration Flow**:
1. Click "Get Started" → Select "Corporate" role
2. Fill in company name (required), industry, company size
3. Corporate profile auto-created
4. Redirected to Corporate Dashboard

**Core Workflows**:

#### Dashboard
- View summary: Total Jobs, Active Jobs, Total Applications, Shortlisted
- Quick actions: Post New Job, Review Applications, View Analytics
- Recent job listings with application counts

#### Job Posting
- Create new job with full form:
  - Title, Description, Requirements
  - Salary Range (in LPA), Job Type, Experience Range
  - Location, Remote Friendly toggle
  - Required Skills (comma-separated)
  - Benefits, Number of Openings
- Job auto-set to ACTIVE status on creation
- AI assists in matching candidates to posted jobs

#### Application Management
- View all applications across all posted jobs
- Filter by application status
- View candidate details with AI Match Score
- Update application status: Shortlist, Schedule Interview, Offer, Reject
- Status changes trigger notifications to candidates
- AI Match Score helps prioritize candidates

#### Company Profile
- Edit company details: name, industry, size
- Update website, description, location
- Verified company badge display
- Company logo upload area

#### Corporate Analytics
- Total jobs, active jobs, applications, shortlisted metrics
- Job performance: applications per job posting
- Source analytics and hiring funnel

### 2.3 Recruiter

**Primary Goal**: Source and manage candidates across multiple job openings.

**Registration Flow**:
1. Click "Get Started" → Select "Recruiter" role
2. Select specialization (IT, Finance, Healthcare, Marketing, General)
3. Recruiter profile auto-created
4. Redirected to Recruiter Dashboard

**Core Workflows**:

#### Dashboard
- Placements count, Active searches, Pipeline candidates, Scheduled interviews
- Quick actions: Find Candidates, View Pipeline, Schedule Interview
- Recent activity feed

#### Candidate Search
- Search by skills, experience, location
- View candidate profiles with skill match percentages
- Add candidates to pipeline

#### Pipeline Management
- Stage-based view: Sourced → Screening → Shortlisted → Interview → Offer → Hired
- Move candidates between stages
- Track pipeline health metrics

#### Interview Scheduling
- Schedule interviews with candidates
- Manage interview calendar
- Interview type selection (Phone, Video, In-person)

#### Recruiter Analytics
- Total placements, monthly placements
- Average time to hire
- Offer acceptance rate
- Performance metrics

## 3. Cross-Cutting Features

### 3.1 AI Match Scoring
- Calculated when a job seeker applies to a job
- Algorithm:
  1. Extract required skills from job posting
  2. Extract candidate skills from profile
  3. Calculate overlap ratio
  4. Factor in experience proximity
  5. Generate score (0-100) and feedback

### 3.2 Skill Auto-Update System
- Triggered when training course is marked complete
- Updates three locations simultaneously:
  1. Job Seeker Profile skills
  2. Default Resume skills section
  3. Skill Assessment records (one per skill)
- Creates analytics event and notification
- Increments AI Skill Score
- No manual intervention required — fully automated

### 3.3 Notification System
- Event-driven notifications:
  - Application submitted
  - Application status updated
  - Training completed / skills auto-updated
  - New job matches found
- Notification bell in navbar with unread count
- Notifications can be marked as read individually or all at once

### 3.4 Analytics & Insights
- Aggregated from AnalyticsEvent records
- AI Career Insights generated based on:
  - Profile completeness analysis
  - Skill gap analysis vs. job market
  - Interview performance trends
  - Application success rates
- Visualized with Recharts (Pie, Bar, Line, Radar charts)

## 4. Data Flows

### 4.1 Application Flow
```
Job Seeker clicks "Apply" 
→ POST /api/applications { jobId, userId }
→ AI Match Score calculated
→ Application record created
→ AnalyticsEvent recorded
→ Notification sent to Job Seeker
→ Application appears in Corporate dashboard
→ Corporate can update status
→ Status change creates Notification for Job Seeker
```

### 4.2 Training → Skill Auto-Update Flow
```
Job Seeker completes training course
→ PUT /api/training { enrollmentId, status: 'completed', skillsAcquired: [...] }
→ JobSeekerProfile.skills updated
→ Default Resume.skills updated
→ SkillAssessment records created
→ AnalyticsEvent recorded
→ Notification sent: "Skills auto-updated!"
→ AI Skill Score incremented
```

### 4.3 AI Mock Interview Flow
```
Job Seeker starts interview
→ POST /api/ai-interview { userId, jobRole, industry, difficulty }
→ Questions generated based on role
→ User answers each question (timed)
→ User submits all responses
→ PUT /api/ai-interview { sessionId, responses }
→ Scores calculated (Communication, Technical, Confidence, Overall)
→ AI Feedback generated
→ If overall score > 60%, SkillAssessment created
→ AnalyticsEvent recorded
→ Results displayed with charts
→ Session saved in Interview History
```

## 5. Business Rules

1. A job seeker can only apply once per job (enforced at API level)
2. AI Match Score is calculated at application time and stored (not dynamic)
3. Skills auto-update only triggers on training completion (progress 100%)
4. Resume auto-update only applies to the default resume
5. Interview questions are role-specific and difficulty-adjusted
6. Profile completeness is calculated from: headline, skills, current role, education, links, resume count
7. AI Skill Score increments by 5 points per training completion
8. Notifications are created for all significant events
9. Corporate users can only manage jobs they posted
10. Application status transitions follow a defined workflow (APPLIED → SCREENING → SHORTLISTED → INTERVIEW → OFFER → HIRED)
