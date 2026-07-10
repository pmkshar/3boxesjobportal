# 3 Boxes Jobs - Functional Specification

## 1. Introduction

This document specifies the functional requirements for the 3 Boxes Jobs AI-Powered Job Portal. It covers all user-facing features, business rules, and interaction flows for each user role.

## 2. User Roles & Access Matrix

### Role Definitions

| Role | Description | Primary Goal |
|------|-------------|--------------|
| Job Seeker | Individual looking for employment | Find and apply for jobs, build resume, upskill |
| Corporate | Company/organization posting jobs | Find and hire qualified candidates |
| Recruiter | Professional sourcing candidates | Match candidates with job openings |
| Admin | System administrator | Manage platform, users, and content |

### Feature Access Matrix

| Feature | Job Seeker | Corporate | Recruiter | Admin |
|---------|-----------|-----------|-----------|-------|
| Landing Page | ✅ | ✅ | ✅ | ✅ |
| Register (as own role) | ✅ | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ | ✅ |
| Job Search | ✅ | ✅ | ✅ | ✅ |
| Apply for Jobs | ✅ | ❌ | ❌ | ❌ |
| AI Resume Builder | ✅ | ❌ | ❌ | ❌ |
| AI Mock Interview | ✅ | ❌ | ❌ | ❌ |
| Training Hub | ✅ | ❌ | ❌ | ❌ |
| AI Skill Auto-Update | ✅ | ❌ | ❌ | ❌ |
| Personal Analytics | ✅ | ❌ | ❌ | ❌ |
| Post Jobs | ❌ | ✅ | ❌ | ❌ |
| Manage Job Listings | ❌ | ✅ | ❌ | ❌ |
| Review Applications | ❌ | ✅ | ❌ | ❌ |
| Company Profile | ❌ | ✅ | ❌ | ❌ |
| Corporate Analytics | ❌ | ✅ | ❌ | ❌ |
| Candidate Search | ❌ | ❌ | ✅ | ❌ |
| Pipeline Management | ❌ | ❌ | ✅ | ❌ |
| Schedule Interviews | ❌ | ❌ | ✅ | ❌ |
| Recruiter Analytics | ❌ | ❌ | ✅ | ❌ |
| Recruiter Profile | ❌ | ❌ | ✅ | ❌ |
| Profile Management | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |

## 3. Landing Page

### 3.1 Hero Section
- **Display**: Company logo (3 stacked boxes SVG), headline, subheadline
- **Headline**: "India's First AI-Powered Career Platform"
- **Subheadline**: "Smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching — all in one platform."
- **CTA Buttons**: "Start as Job Seeker" (emerald), "Post as Employer" (outline)
- **Stats Bar**: 10K+ Active Jobs, 5K+ Companies, 50K+ Candidates, 1K+ AI Interviews

### 3.2 Features Section
- Six feature cards with icons, titles, and descriptions:
  1. AI Resume Builder
  2. Smart Job Matching
  3. AI Mock Interviews
  4. Skill Auto-Update
  5. AI Analytics
  6. Training Hub

### 3.3 How It Works Section
- Two-column layout:
  - For Job Seekers: 3 steps (Create Profile → Train & Get Matched → Interview & Get Hired)
  - For Employers: 3 steps (Post Jobs → Review AI-Matched Candidates → Hire the Best)

### 3.4 Testimonials Section
- Three testimonial cards with ratings

### 3.5 CTA Section
- Full-width gradient banner with "Ready to Transform Your Career?" headline
- Demo credentials displayed: seeker@3boxes.com / demo123

### 3.6 Footer
- Company info, For Job Seekers links, For Employers links, Company links

## 4. Authentication

### 4.1 Registration
- **Dialog-based**: Opens in a modal from landing page
- **Role Selection**: Three card options (Job Seeker, Corporate, Recruiter) with icons
- **Required Fields**: Full Name, Email, Password
- **Conditional Fields**:
  - Corporate: Company Name (required), Industry (select), Company Size (select)
  - Recruiter: Specialization (select)
- **Validation**: All required fields must be filled, email must be unique
- **Success**: Auto-switch to login tab with pre-filled credentials

### 4.2 Login
- **Fields**: Email, Password
- **Demo Quick Access**: Three buttons to auto-fill demo credentials for each role
- **Validation**: Email and password required
- **Success**: Redirect to role-specific dashboard

### 4.3 Session Management
- **Storage**: Zustand store persisted to localStorage (key: `3boxes-auth`)
- **Data Stored**: User object (id, email, name, role, avatar, phone, location) + token
- **Logout**: Clears store and reloads page

## 5. Job Seeker Portal

### 5.1 Dashboard
- **Welcome Banner**: Personalized greeting with AI interview score badge
- **Stats Cards**: Applications, Interviews, Trainings Done, Profile Strength
- **Quick Actions**: Find Jobs, Build Resume, AI Interview, Start Training
- **AI Career Insights**: Dynamic recommendations card

### 5.2 Job Search
- **Search Bar**: Full-text search by title, skill, or company
- **Filters**: Job Type (Full Time, Part Time, Contract, Remote), Remote toggle
- **Job Cards**: Company logo placeholder, title, company, location, type, skills badges, salary, posted date
- **Pagination**: Page-based with Previous/Next buttons
- **Job Detail Dialog**: Full description, requirements, skills, benefits, Apply Now button
- **Apply Flow**: Click "Apply Now" → API call → AI match score returned → Toast notification

### 5.3 Applications
- List of all submitted applications with status tracking
- Status badges: Applied, Screening, Shortlisted, Interview Scheduled, Interviewed, Offered, Hired, Rejected, Withdrawn
- AI Match Score display for each application

### 5.4 Resume Builder
- **Resume List**: Display all resumes with default indicator
- **Create New Resume**: From scratch or AI-enhanced template
- **Resume Sections**:
  1. **Summary**: Professional summary text area
  2. **Experience**: Add/edit/remove entries (Company, Role, Duration, Description)
  3. **Education**: Add/edit/remove entries (Institution, Degree, Year, Grade)
  4. **Skills**: Add/edit/remove entries (Name, Level, Source)
  5. **Certifications**: Add/edit/remove entries (Name, Year, Issuer)
  6. **Projects**: Add/edit/remove entries (Name, Description, Link)
  7. **Languages**: Add/edit/remove entries (Name, Proficiency)
  8. **Achievements**: Add/edit/remove text entries
- **AI Enhance**: Button to trigger AI content enhancement for summary, experience descriptions
- **Template Selection**: Professional, Modern, Minimal, Creative
- **Preview**: Side-by-side preview of formatted resume
- **Auto-Update**: Resume skills section automatically updates when training is completed

### 5.5 AI Mock Interview
- **Setup Phase**:
  - Job Role selection (Software Engineer, Data Scientist, Product Manager, etc.)
  - Industry selection (optional)
  - Difficulty level (Beginner, Intermediate, Advanced)
  - "Start Interview" button
  - "View Past Interviews" button
- **Interview Phase**:
  - Question display with category badge
  - Timed response (120 seconds per question, configurable)
  - Word count display
  - Previous/Next navigation
  - Progress bar
  - Timer with red warning under 30 seconds
- **Results Phase**:
  - Overall score (percentage with color coding: green ≥70%, amber ≥50%, red <50%)
  - Category scores: Communication, Technical, Confidence
  - AI Feedback text with improvement suggestions
  - "Practice Again" and "View History" buttons
- **History Phase**:
  - List of past interview sessions with role, difficulty, date, score

### 5.6 Training Hub
- **Course Catalog**: Grid of course cards with:
  - Color-coded gradient thumbnail by category
  - Category badge
  - Title, description
  - Duration, rating, enrollment count
  - Skill badges (up to 3 shown)
  - Enroll/Continue/Complete button based on enrollment status
- **Category Filter**: All, Programming, Data Science, Cloud Computing, Marketing, Product, Design
- **AI Skill Auto-Update Notice**: Prominent banner explaining that completing courses auto-updates skills
- **Enrollment Flow**: Click "Enroll Free" → API call → Card updates with progress bar
- **Completion Flow**: Click "Complete Course" → API triggers:
  1. Enrollment status → completed
  2. Skills from course added to user profile
  3. All active resumes updated with new skills
  4. Skill assessments created/updated
  5. Toast notification: "Your skills and resume have been auto-updated!"

### 5.7 AI Analytics Dashboard
- **Summary Cards**: Applications, Interviews, Trainings, Profile Strength, AI Interview Score, Skills Count, Resumes, Avg Match Score
- **Charts**:
  1. Application Status Distribution (Pie Chart)
  2. Skill Assessment Levels (Bar Chart)
  3. Recent Activity (Line Chart)
  4. Interview Score Trends (Multi-Line Chart)
  5. Skill Radar (Radar Chart)
- **AI Career Insights**: Dynamic recommendations for skill gaps, training suggestions, job market trends

### 5.8 Profile
- **Profile Completeness**: Progress bar with percentage
- **Basic Information**: Name (read-only), Email (read-only), Phone, Location
- **Professional Details**: Headline, Current Role, Current Company, Experience Years, Expected Salary, Job Type, Education
- **Skills**: Badge list with add/remove functionality, AI Skill Score badge
- **Social Links**: LinkedIn, GitHub, Portfolio

## 6. Corporate Portal

### 6.1 Dashboard
- **Welcome Banner**: "Welcome, [Company Name]!"
- **Stats Cards**: Total Jobs, Active Jobs, Applications, Shortlisted
- **Recent Jobs**: List of 3 most recent job postings with application count
- **Quick Actions**: Post New Job, Review Applications, View Analytics

### 6.2 Post Job
- **Form Fields**:
  - Title (required), Description (required), Requirements
  - Min/Max Salary (in LPA, stored as actual INR values)
  - Job Type (Full Time, Part Time, Contract, Remote)
  - Min/Max Experience (years)
  - Location, Required Skills (comma-separated), Benefits
  - Remote Friendly checkbox
- **Auto-link**: Job is automatically linked to the corporate profile

### 6.3 My Jobs
- List of all posted jobs with status badges (ACTIVE, DRAFT, PAUSED, CLOSED)
- Job details: title, location, posted date, application count

### 6.4 Applications
- List of all applications received for company's jobs
- Each application shows: candidate name, AI match score, current status
- Actions: Shortlist (green check), Reject (red X)
- Status updates via API

### 6.5 Company Profile
- Editable fields: Company Name, Industry, Company Size, Website, Description, Location
- Save Profile button (currently client-side only)

### 6.6 Corporate Analytics
- Stats overview cards
- Job performance table showing each job and its application count

## 7. Recruiter Portal

### 7.1 Dashboard
- **Welcome Banner**: "Welcome, [Recruiter Name]!"
- **Stats Cards**: Placements, Active Searches, In Pipeline, Interviews
- **Quick Actions**: Find Candidates, View Pipeline, Schedule Interview
- **Recent Activity**: Feed of recent recruiting events

### 7.2 Find Candidates
- Search filters: Skills, Experience, Location
- Search button triggers candidate search
- Empty state with search prompt

### 7.3 Pipeline
- Kanban-style view with stages: Sourced, Screening, Shortlisted, Interview, Offer, Hired
- Empty stage placeholders

### 7.4 Interviews
- Interview scheduling interface
- Empty state with "Schedule Interview" button

### 7.5 Recruiter Analytics
- Stats: Total Placements, This Month, Avg Time to Hire, Offer Accept Rate

### 7.6 Recruiter Profile
- Profile display: Name, Role, Specialization, Years Experience
- Stats: Placement Count, Rating
- Save Profile button

## 8. AI Skill Auto-Update System (Core Feature)

### Business Rules
1. Skills are ONLY auto-updated when a training course is completed
2. Manual skill additions by the user are preserved (not overwritten)
3. AI-updated skills are tagged with source="training" in SkillAssessment
4. When training is completed:
   - All skills from the course's `skills` field are processed
   - Each skill is either:
     - Created as new SkillAssessment record (if not exists)
     - Updated with higher level (if training improves existing skill)
   - The JobSeekerProfile.skills string is updated to include new skills
   - All active resumes' skill sections are updated
   - The `lastAiUpdate` timestamp is set on updated resumes

### Data Flow
```
TrainingEnrollment.status = "completed"
        │
        ├── skillsAcquired (from course.skills)
        │       │
        │       ├── SkillAssessment.upsert (for each skill)
        │       │       source = "training"
        │       │       level = calculated based on course difficulty + score
        │       │
        │       ├── JobSeekerProfile.skills (append new skills)
        │       │
        │       └── Resume.skills (update all active resumes)
        │               lastAiUpdate = now()
        │               aiGenerated = true
        │
        └── Notification.create
                title: "Skills Updated!"
                message: "Your profile and resume have been updated with new skills"
```

### Skill Scoring Algorithm
```
baseLevel = 50 (beginner) | 65 (intermediate) | 80 (advanced)
courseScoreBonus = (enrollmentScore / 100) * 15
newLevel = min(100, baseLevel + courseScoreBonus)
```

## 9. AI Mock Interview System

### Question Generation
Questions are generated based on three parameters:
- **Job Role**: Determines the technical domain
- **Industry**: Adds industry-specific context
- **Difficulty**: Controls complexity and expected depth

### Question Categories
1. **General**: Introduction, background, motivation
2. **Technical**: Role-specific technical questions
3. **Behavioral**: Situational and team dynamics
4. **Problem-Solving**: Analytical and design challenges

### Scoring System
Each interview response is scored across three dimensions (0-100):

1. **Communication Score**: Based on:
   - Response length (adequate detail)
   - Structure (clear beginning, middle, end)
   - Clarity (specific examples, concrete details)

2. **Technical Score**: Based on:
   - Technical accuracy of content
   - Depth of technical knowledge demonstrated
   - Use of specific technologies/tools mentioned

3. **Confidence Score**: Based on:
   - Assertiveness of language
   - Providing definitive answers vs hedging
   - Demonstrating ownership of achievements

### Overall Score Calculation
```
overallScore = (communicationScore * 0.3) + (technicalScore * 0.5) + (confidenceScore * 0.2)
```

### AI Feedback Generation
Feedback is generated covering:
- Strengths identified in the response
- Areas for improvement
- Specific suggestions for better responses
- Recommended resources for preparation

## 10. Notification System

### Notification Types
- **info**: General information (Welcome, tips)
- **success**: Positive events (Application submitted, Skills updated)
- **warning**: Important notices (Incomplete profile, Expiring job)
- **error**: Error notifications (Application failed, System error)

### Notification Flow
1. Event triggers notification creation in database
2. Navbar fetches unread count via `GET /api/notifications?userId=xxx`
3. Unread count displayed as red badge on bell icon
4. User clicks notification → mark as read → navigate to link

## 11. Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm) — Bottom navigation, single column layouts
- **Tablet**: 640px-1024px (sm-lg) — Two column grids, condensed sidebar
- **Desktop**: > 1024px (lg+) — Full sidebar, multi-column layouts

### Mobile-Specific
- Bottom navigation bar with top 5 nav items
- Full-width cards and forms
- Collapsible sections
- Touch-friendly targets (44px minimum)

### Desktop-Specific
- Sidebar navigation (collapsible)
- Multi-column grid layouts
- Side-by-side resume preview
- Expanded data tables
