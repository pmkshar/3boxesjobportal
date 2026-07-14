/**
 * Memory Store - In-memory JSON database for Vercel deployment
 *
 * Problem: SQLite (file-based) doesn't work on Vercel's serverless environment
 * because the filesystem is ephemeral/read-only. Prisma throws errors when
 * trying to access a non-existent database file, causing 500 errors.
 *
 * Solution: This in-memory store acts as a reliable fallback that:
 * 1. Works on Vercel without any external database
 * 2. Provides all demo data (users, jobs, courses, etc.)
 * 3. Supports full CRUD operations
 * 4. Falls back gracefully when Prisma/DB is unavailable
 *
 * Note: Data resets on each serverless cold start, but for a demo portal
 * this is acceptable. For production, switch to Turso/Neon Postgres.
 */

import { hashPassword, verifyPassword, generateToken } from './auth'

// Types
interface UserRecord {
  id: string
  email: string
  name: string
  password: string
  role: 'JOB_SEEKER' | 'CORPORATE' | 'RECRUITER' | 'ADMIN'
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  jobSeekerProfile?: any
  corporateProfile?: any
  recruiterProfile?: any
}

interface JobRecord {
  id: string
  corporateId: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  jobType: string
  experienceMin?: number
  experienceMax?: number
  location?: string
  isRemote: boolean
  skills?: string
  benefits?: string
  openings: number
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED'
  aiMatchScore: boolean
  postedDate: string
  closingDate?: string
  createdAt: string
  updatedAt: string
  corporate?: any
}

interface CourseRecord {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  skills?: string
  instructor?: string
  thumbnailUrl?: string
  rating: number
  enrollCount: number
  isActive: boolean
  createdAt: string
}

let _users: UserRecord[] = []
let _jobs: JobRecord[] = []
let _courses: CourseRecord[] = []
let _aiAgents: any[] = []
let _aiAgentTasks: any[] = []
let _aiAgentEmails: any[] = []
let _aiEmailTemplates: any[] = []
let _aiAgentDailyStats: any[] = []
let _aiCompanyScrapes: any[] = []
let _initialized = false
let _dbAvailable = false

// ID generator
let _idCounter = 100
function genId(): string {
  _idCounter++
  return `clmem${String(_idCounter).padStart(20, '0')}`
}

// Seed demo data into memory store
function seedMemoryData() {
  const demoPassword = hashPassword('demo123')

  _users = [
    {
      id: 'demo-seeker-001',
      email: 'seeker@3boxes.com',
      name: 'Rahul Sharma',
      password: demoPassword,
      role: 'JOB_SEEKER',
      phone: '+91-9876543210',
      location: 'Mumbai, India',
      bio: 'Passionate software developer with 5 years of experience in full-stack development.',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobSeekerProfile: {
        id: 'jsp-001',
        userId: 'demo-seeker-001',
        headline: 'Senior Full-Stack Developer | React & Node.js Expert',
        experienceYears: 5,
        currentRole: 'Software Engineer',
        currentCompany: 'TechCorp India',
        education: 'B.Tech Computer Science - IIT Mumbai',
        expectedSalary: '15-20 LPA',
        jobType: 'full-time',
        availability: '1-month',
        skills: 'React, Node.js, TypeScript, Python, AWS, Docker, MongoDB, PostgreSQL, GraphQL, CI/CD, Git, Agile',
        linkedInUrl: 'https://linkedin.com/in/rahulsharma',
        githubUrl: 'https://github.com/rahulsharma',
        aiSkillScore: 78,
        profileComplete: 85,
      },
    },
    {
      id: 'demo-corp-001',
      email: 'corp@3boxes.com',
      name: 'Priya Technologies',
      password: demoPassword,
      role: 'CORPORATE',
      phone: '+91-22-12345678',
      location: 'Bangalore, India',
      bio: 'Leading IT solutions provider specializing in cloud computing, AI/ML solutions, and enterprise software development.',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      corporateProfile: {
        id: 'corp-profile-001',
        userId: 'demo-corp-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        companySize: '201-500',
        website: 'https://priyatech.com',
        description: 'Leading IT solutions provider specializing in cloud computing, AI/ML solutions, and enterprise software development.',
        location: 'Bangalore, India',
        foundedYear: 2015,
        isVerified: true,
      },
    },
    {
      id: 'demo-recruiter-001',
      email: 'recruiter@3boxes.com',
      name: 'Amit Patel',
      password: demoPassword,
      role: 'RECRUITER',
      phone: '+91-9988776655',
      location: 'Delhi, India',
      bio: 'Senior IT recruiter with 8 years of experience in talent acquisition.',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recruiterProfile: {
        id: 'rec-profile-001',
        userId: 'demo-recruiter-001',
        specialization: 'IT & Software',
        yearsExperience: 8,
        certifications: 'SHRM-CP, AIRS CIR',
        placementCount: 150,
        rating: 4.8,
      },
    },
    {
      id: 'demo-admin-001',
      email: 'admin@3boxes.com',
      name: '3 Boxes Admin',
      password: demoPassword,
      role: 'ADMIN',
      phone: '+91-9000000000',
      location: 'Chennai, India',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-superadmin-001',
      email: 'superadmin@3boxes.com',
      name: 'Super Admin',
      password: demoPassword,
      role: 'SUPER_ADMIN',
      phone: '+91-9111111111',
      location: 'Mumbai, India',
      bio: 'System super administrator with full access to all portal features and user management.',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-hr-001',
      email: 'hr@3boxes.com',
      name: 'Sneha Reddy',
      password: demoPassword,
      role: 'HR_MANAGER',
      phone: '+91-9222222222',
      location: 'Hyderabad, India',
      bio: 'HR Manager responsible for recruitment pipeline and interview scheduling.',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-interviewer-001',
      email: 'interviewer@3boxes.com',
      name: 'Vikram Singh',
      password: demoPassword,
      role: 'INTERVIEWER',
      phone: '+91-9333333333',
      location: 'Delhi, India',
      bio: 'Technical interviewer specializing in frontend and system design interviews.',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  _jobs = [
    {
      id: 'job-001',
      corporateId: 'corp-profile-001',
      title: 'Senior React Developer',
      description: 'We are looking for an experienced React developer to join our frontend team. You will be responsible for building and maintaining high-quality web applications using React, TypeScript, and modern tooling. Work closely with designers, backend engineers, and product managers to deliver exceptional user experiences.',
      requirements: '5+ years React experience, TypeScript, REST APIs, GraphQL, Testing (Jest/Cypress), CI/CD',
      responsibilities: 'Build reusable UI components, implement state management, optimize performance, mentor junior developers, participate in code reviews',
      salaryMin: 1200000,
      salaryMax: 2000000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 5,
      experienceMax: 8,
      location: 'Bangalore, India',
      isRemote: true,
      skills: 'React, TypeScript, GraphQL, Redux, Jest, Cypress, Node.js, AWS',
      benefits: 'Health insurance, Stock options, Flexible hours, Remote work, Learning budget',
      openings: 3,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-002',
      corporateId: 'corp-profile-001',
      title: 'Data Scientist - AI/ML',
      description: 'Join our AI team to develop cutting-edge machine learning models and data pipelines. You will work with large datasets, build predictive models, and deploy ML solutions at scale. Ideal candidate has strong statistical background and hands-on experience with deep learning frameworks.',
      requirements: 'Masters/PhD in CS/Statistics, Python, TensorFlow/PyTorch, SQL, Spark, ML model deployment',
      responsibilities: 'Design ML pipelines, develop predictive models, collaborate with engineering, present findings to stakeholders',
      salaryMin: 1500000,
      salaryMax: 2500000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 3,
      experienceMax: 6,
      location: 'Hyderabad, India',
      isRemote: false,
      skills: 'Python, TensorFlow, PyTorch, SQL, Spark, Statistics, Deep Learning, NLP',
      benefits: 'Health insurance, Conference budget, Stock options, Research time',
      openings: 2,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-003',
      corporateId: 'corp-profile-001',
      title: 'DevOps Engineer',
      description: 'We need a skilled DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. You will work with AWS/GCP services, containerization, and infrastructure as code. Help us achieve zero-downtime deployments and maintain 99.9% uptime SLA.',
      requirements: 'AWS/GCP, Docker, Kubernetes, Terraform, Jenkins/GitHub Actions, Linux, Networking',
      responsibilities: 'Manage cloud infrastructure, automate deployments, monitor system health, implement security best practices',
      salaryMin: 1000000,
      salaryMax: 1800000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 3,
      experienceMax: 7,
      location: 'Pune, India',
      isRemote: true,
      skills: 'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Python, Monitoring',
      benefits: 'Health insurance, Cloud certification budget, Flexible hours, Remote work',
      openings: 2,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-004',
      corporateId: 'corp-profile-001',
      title: 'Product Manager - SaaS',
      description: 'Lead the product strategy and roadmap for our B2B SaaS platform. Work with engineering, design, and sales teams to deliver features that drive customer value and business growth. Experience with agile methodologies and data-driven decision making is essential.',
      requirements: '5+ years PM experience in SaaS, Agile/Scrum, Analytics, Roadmap planning, User research',
      responsibilities: 'Define product roadmap, prioritize features, conduct user research, track KPIs, coordinate cross-functional teams',
      salaryMin: 1800000,
      salaryMax: 3000000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 5,
      experienceMax: 10,
      location: 'Mumbai, India',
      isRemote: false,
      skills: 'Product Strategy, Agile, Analytics, User Research, SaaS, Roadmapping, A/B Testing',
      benefits: 'Health insurance, Stock options, Travel budget, Learning budget',
      openings: 1,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 259200000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-005',
      corporateId: 'corp-profile-001',
      title: 'UI/UX Designer',
      description: 'Create beautiful and intuitive user interfaces for our suite of products. You will lead the design process from research and wireframing to high-fidelity mockups and prototyping. Collaborate with product and engineering to deliver delightful user experiences.',
      requirements: '3+ years UI/UX experience, Figma/Sketch, Design systems, User research, Prototyping, HTML/CSS',
      responsibilities: 'Conduct user research, create wireframes and prototypes, maintain design system, present designs to stakeholders',
      salaryMin: 800000,
      salaryMax: 1500000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 3,
      experienceMax: 6,
      location: 'Chennai, India',
      isRemote: true,
      skills: 'Figma, Sketch, Design Systems, User Research, Prototyping, HTML/CSS, Adobe Creative Suite',
      benefits: 'Design tool subscriptions, Conference budget, Flexible hours, Creative time',
      openings: 2,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 345600000).toISOString(),
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 345600000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-006',
      corporateId: 'corp-profile-001',
      title: 'Backend Engineer - Node.js',
      description: 'Build robust and scalable backend services using Node.js, Express, and PostgreSQL. Design APIs, implement business logic, and ensure high availability for our growing platform.',
      requirements: '4+ years Node.js, Express, PostgreSQL/MySQL, REST API design, Redis, Microservices',
      responsibilities: 'Design and build REST APIs, optimize database queries, implement caching strategies, ensure system reliability',
      salaryMin: 1000000,
      salaryMax: 1800000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 4,
      experienceMax: 7,
      location: 'Bangalore, India',
      isRemote: true,
      skills: 'Node.js, Express, PostgreSQL, Redis, Microservices, Docker, CI/CD, TypeScript',
      benefits: 'Health insurance, Stock options, Remote work, Learning budget',
      openings: 2,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 432000000).toISOString(),
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date(Date.now() - 432000000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-007',
      corporateId: 'corp-profile-001',
      title: 'Mobile Developer - React Native',
      description: 'Develop cross-platform mobile applications using React Native. Work on features used by millions of users, optimize performance, and deliver pixel-perfect UI on both iOS and Android.',
      requirements: '3+ years React Native, JavaScript/TypeScript, iOS & Android deployment, Redux/MobX',
      responsibilities: 'Build mobile features, ensure cross-platform compatibility, optimize app performance, release to app stores',
      salaryMin: 900000,
      salaryMax: 1600000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 3,
      experienceMax: 6,
      location: 'Hyderabad, India',
      isRemote: true,
      skills: 'React Native, TypeScript, Redux, iOS, Android, Firebase, App Store Deployment',
      benefits: 'Health insurance, Device budget, Remote work, Flexible hours',
      openings: 1,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 518400000).toISOString(),
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      updatedAt: new Date(Date.now() - 518400000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
    {
      id: 'job-008',
      corporateId: 'corp-profile-001',
      title: 'Cybersecurity Analyst',
      description: 'Protect our digital assets and infrastructure from cyber threats. Implement security policies, conduct vulnerability assessments, and respond to security incidents. Must stay current with evolving threat landscape.',
      requirements: '3+ years in cybersecurity, CISSP/CEH, SIEM tools, Incident response, Network security',
      responsibilities: 'Monitor security alerts, conduct penetration testing, implement security policies, respond to incidents, train staff',
      salaryMin: 1100000,
      salaryMax: 1900000,
      salaryCurrency: 'INR',
      jobType: 'full-time',
      experienceMin: 3,
      experienceMax: 6,
      location: 'Pune, India',
      isRemote: false,
      skills: 'CISSP, CEH, SIEM, Penetration Testing, Network Security, Incident Response, Compliance',
      benefits: 'Health insurance, Certification budget, Flexible hours, Training budget',
      openings: 1,
      status: 'ACTIVE',
      aiMatchScore: false,
      postedDate: new Date(Date.now() - 604800000).toISOString(),
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
      corporate: {
        id: 'corp-profile-001',
        companyName: 'Priya Technologies Pvt Ltd',
        industry: 'Information Technology',
        location: 'Bangalore, India',
      },
    },
  ]

  _courses = [
    {
      id: 'react-advanced-patterns-performance',
      title: 'React Advanced Patterns & Performance',
      description: 'Master advanced React patterns including hooks, context, render optimization, and state management with Redux Toolkit. Build production-ready applications with best practices.',
      category: 'Programming',
      level: 'advanced',
      duration: 24,
      skills: 'React, TypeScript, Redux Toolkit, Performance Optimization, Testing',
      instructor: 'Dr. Sarah Chen',
      rating: 4.9,
      enrollCount: 2500,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'machine-learning-python',
      title: 'Machine Learning with Python',
      description: 'Comprehensive course on machine learning fundamentals and advanced techniques. Covers supervised/unsupervised learning, deep learning, and model deployment using Python and TensorFlow.',
      category: 'Data Science',
      level: 'intermediate',
      duration: 40,
      skills: 'Python, TensorFlow, Scikit-learn, Pandas, NumPy, Deep Learning, NLP',
      instructor: 'Prof. Raj Kumar',
      rating: 4.8,
      enrollCount: 3200,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'aws-cloud-solutions-architect',
      title: 'AWS Cloud Practitioner to Solutions Architect',
      description: 'Complete AWS certification prep from Cloud Practitioner to Solutions Architect. Hands-on labs with real AWS services.',
      category: 'Cloud Computing',
      level: 'intermediate',
      duration: 36,
      skills: 'AWS, EC2, S3, Lambda, CloudFormation, IAM, VPC, RDS',
      instructor: 'Kevin Johnson',
      rating: 4.7,
      enrollCount: 1800,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'system-design-senior-engineers',
      title: 'System Design for Senior Engineers',
      description: 'Learn how to design scalable distributed systems. Covers load balancing, caching, database sharding, message queues, and microservices architecture.',
      category: 'Programming',
      level: 'advanced',
      duration: 20,
      skills: 'System Design, Distributed Systems, Scalability, Load Balancing, Caching, Microservices',
      instructor: 'Alex Rivera',
      rating: 4.9,
      enrollCount: 2100,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fullstack-nodejs-development',
      title: 'Full-Stack Node.js Development',
      description: 'Build complete web applications with Node.js, Express, and MongoDB. Learn REST API design, authentication, real-time features with Socket.io.',
      category: 'Programming',
      level: 'intermediate',
      duration: 30,
      skills: 'Node.js, Express, MongoDB, REST API, Socket.io, JWT, Deployment',
      instructor: 'Meera Iyer',
      rating: 4.6,
      enrollCount: 1500,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'digital-marketing-masterclass',
      title: 'Digital Marketing Masterclass',
      description: 'Comprehensive digital marketing course covering SEO, SEM, social media marketing, content marketing, email marketing, and analytics.',
      category: 'Marketing',
      level: 'beginner',
      duration: 18,
      skills: 'SEO, SEM, Social Media Marketing, Google Analytics, Content Marketing, Email Marketing',
      instructor: 'Lisa Wong',
      rating: 4.5,
      enrollCount: 1200,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'docker-kubernetes-production',
      title: 'Docker & Kubernetes in Production',
      description: 'Master containerization and orchestration for production environments. Learn Docker best practices, Kubernetes deployment strategies, Helm charts, and monitoring.',
      category: 'Cloud Computing',
      level: 'intermediate',
      duration: 28,
      skills: 'Docker, Kubernetes, Helm, Prometheus, Grafana, CI/CD, Container Security',
      instructor: 'Tom Anderson',
      rating: 4.8,
      enrollCount: 1900,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'product-management-fundamentals',
      title: 'Product Management Fundamentals',
      description: 'Learn the essentials of product management - from market research and user interviews to roadmap planning and go-to-market strategy.',
      category: 'Product',
      level: 'beginner',
      duration: 15,
      skills: 'Product Strategy, User Research, Roadmapping, A/B Testing, Analytics, Agile',
      instructor: 'Jennifer Park',
      rating: 4.7,
      enrollCount: 980,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]

  // ─── Seed AI Agents ──────────────────────────────────────────
  const now = new Date()
  const agentIds = ['agent-company-001', 'agent-candidate-001', 'agent-hr-001', 'agent-dataentry-001']

  _aiAgents = [
    {
      id: agentIds[0],
      name: 'Company Outreach Agent',
      type: 'ADMIN_OUTREACH_COMPANY',
      description: 'Automatically scrapes company websites for careers pages and contact emails, then sends introduction emails about our portal. Follows up until the company onboards.',
      status: 'ACTIVE',
      dailyLimit: 50,
      dailySent: 8,
      totalTasks: 12,
      totalSuccess: 5,
      totalFailed: 2,
      totalEmailsSent: 35,
      totalResponses: 8,
      totalConversions: 3,
      avgResponseRate: 0.23,
      strategy: JSON.stringify({
        targetIndustry: 'Technology, Finance, Healthcare',
        emailTemplate: 'company_introduction',
        followUpInterval: '3_days',
        maxFollowUps: '5',
        searchKeywords: 'careers, jobs, hiring, contact us',
      }),
      createdBy: 'demo-admin-001',
      lastRunAt: new Date(now.getTime() - 3600000).toISOString(),
      dailyResetAt: now.toISOString(),
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: agentIds[1],
      name: 'Candidate Outreach Agent',
      type: 'ADMIN_OUTREACH_CANDIDATE',
      description: 'Sends personalized emails to job seekers encouraging them to onboard our portal. Includes job recommendations based on their profile.',
      status: 'ACTIVE',
      dailyLimit: 50,
      dailySent: 12,
      totalTasks: 8,
      totalSuccess: 4,
      totalFailed: 1,
      totalEmailsSent: 28,
      totalResponses: 6,
      totalConversions: 4,
      avgResponseRate: 0.21,
      strategy: JSON.stringify({
        emailTemplate: 'candidate_introduction',
        followUpInterval: '5_days',
        maxFollowUps: '3',
        includeJobRecommendations: 'true',
      }),
      createdBy: 'demo-admin-001',
      lastRunAt: new Date(now.getTime() - 7200000).toISOString(),
      dailyResetAt: now.toISOString(),
      createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: agentIds[2],
      name: 'HR Outreach Agent',
      type: 'ADMIN_OUTREACH_HR',
      description: 'Targets HR heads, HR managers, and HR executives to onboard them to our portal. Sends personalized introduction emails and follows up.',
      status: 'ACTIVE',
      dailyLimit: 50,
      dailySent: 15,
      totalTasks: 15,
      totalSuccess: 6,
      totalFailed: 3,
      totalEmailsSent: 42,
      totalResponses: 10,
      totalConversions: 5,
      avgResponseRate: 0.24,
      strategy: JSON.stringify({
        targetRoles: 'HR Head, HR Manager, HR Executive, Talent Acquisition Lead',
        emailTemplate: 'hr_introduction',
        followUpInterval: '4_days',
        maxFollowUps: '4',
        linkedInSearch: 'true',
      }),
      createdBy: 'demo-admin-001',
      lastRunAt: new Date(now.getTime() - 1800000).toISOString(),
      dailyResetAt: now.toISOString(),
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: agentIds[3],
      name: 'Data Entry Agent',
      type: 'ADMIN_DATA_ENTRY',
      description: 'Upload resumes (ZIP/individual) to automatically extract candidate information, create profiles in the portal, and send welcome emails with login credentials.',
      status: 'ACTIVE',
      dailyLimit: 200,
      dailySent: 0,
      totalTasks: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalEmailsSent: 0,
      totalResponses: 0,
      totalConversions: 0,
      avgResponseRate: 0,
      strategy: JSON.stringify({
        autoCreateCandidates: 'true',
        sendWelcomeEmail: 'true',
        welcomeEmailTemplate: 'candidate_welcome',
        defaultPassword: 'demo123',
        requireEmailVerification: 'false',
      }),
      createdBy: 'demo-admin-001',
      lastRunAt: null,
      dailyResetAt: now.toISOString(),
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ]

  // Seed AI Email Templates
  _aiEmailTemplates = [
    {
      id: 'tpl-company-intro-001',
      name: 'Company Introduction',
      agentType: 'ADMIN_OUTREACH_COMPANY',
      subject: "3 Boxes Jobs - India's AI-Powered Recruitment Platform | Partnership Opportunity",
      body: `Dear {{recipientName}},\n\nI hope this email finds you well. I'm reaching out from 3 Boxes Jobs, India's fastest-growing AI-powered recruitment platform that connects top talent with leading companies like {{companyName}}.\n\nWhat makes us different:\n• AI-powered candidate matching with 95%+ accuracy\n• Pre-screened candidates with verified skills\n• 70% faster hiring process compared to traditional methods\n• Access to 50,000+ active job seekers across India\n\nI'd love to explore how 3 Boxes Jobs can streamline your hiring process at {{companyName}}. Would you be available for a brief 15-minute call this week?\n\nLooking forward to connecting!\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
      category: 'introduction',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'tpl-company-followup-001',
      name: 'Company Follow-up',
      agentType: 'ADMIN_OUTREACH_COMPANY',
      subject: 'Following up - 3 Boxes Jobs Partnership',
      body: `Dear {{recipientName}},\n\nI wanted to follow up on my previous email about partnering with 3 Boxes Jobs for your hiring needs at {{companyName}}.\n\nWe've recently helped companies like yours reduce their time-to-hire by 60% and improve candidate quality by 40%.\n\nWould you be interested in a quick demo? I can show you how our AI matching works in just 10 minutes.\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
      category: 'follow_up',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'tpl-candidate-intro-001',
      name: 'Candidate Introduction',
      agentType: 'ADMIN_OUTREACH_CANDIDATE',
      subject: 'Your Dream Job is Waiting | 3 Boxes Jobs',
      body: `Hi {{recipientName}},\n\nI noticed your impressive background and wanted to introduce you to 3 Boxes Jobs - India's AI-powered job portal that matches you with the perfect opportunities.\n\nWhy join 3 Boxes Jobs?\n• AI-powered job matching based on your skills & experience\n• Free resume builder with ATS optimization\n• Interview preparation with AI mock interviews\n• Access to 10,000+ jobs from top companies\n• Real-time application tracking\n\nRegistration is completely free! Join thousands of professionals who've already found their dream roles through our platform.\n\nSign up now: {{portalUrl}}\n\nBest regards,\nThe 3 Boxes Jobs Team`,
      category: 'introduction',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'tpl-hr-intro-001',
      name: 'HR Introduction',
      agentType: 'ADMIN_OUTREACH_HR',
      subject: 'Transform Your Hiring with 3 Boxes Jobs | Special Invitation for HR Leaders',
      body: `Dear {{recipientName}},\n\nAs an HR leader, you know the challenges of finding the right talent quickly. 3 Boxes Jobs is India's AI-powered recruitment platform designed specifically to address these challenges.\n\nWhy HR leaders choose 3 Boxes Jobs:\n• AI-powered screening reduces unqualified applications by 80%\n• Automated interview scheduling saves 15+ hours per week\n• Skills-based matching ensures cultural fit\n• Employer branding tools to attract top talent\n• Analytics dashboard for data-driven hiring decisions\n\nI'd love to invite you to explore our platform and see how it can benefit your organization. We offer a free 30-day trial for new companies.\n\nWould you be interested in a personalized demo?\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
      category: 'introduction',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'tpl-candidate-welcome-001',
      name: 'Candidate Welcome',
      agentType: 'ADMIN_DATA_ENTRY',
      subject: 'Welcome to 3 Boxes Jobs! Your Account is Ready | Login Details Inside',
      body: `Hi {{recipientName}},\n\nWelcome to 3 Boxes Jobs - India's AI-Powered Recruitment Platform!\n\nYour account has been created and you can now access our platform to:\n• Get AI-matched job recommendations based on your profile\n• Apply to 10,000+ jobs from top companies across India\n• Track your applications in real-time\n• Build your resume with our AI Resume Builder\n• Practice interviews with AI Mock Interviews\n\nYour Login Details:\nEmail: {{recipientEmail}}\nPassword: {{tempPassword}}\n\nLogin Now: {{portalUrl}}/login\n\nImportant: Please change your password after your first login for security.\n\nWe've already set up your profile based on your resume. You can review and update it anytime from your dashboard.\n\nStart exploring: {{portalUrl}}/find-jobs\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
      category: 'welcome',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]

  // Seed AI Agent Tasks (sample recent tasks)
  const taskTypes = ['SCRAPE_COMPANY', 'SEND_EMAIL', 'FOLLOW_UP', 'EXTRACT_EMAIL']
  const taskStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'APPROVED', 'RUNNING', 'FAILED']
  const companies = ['TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'Google India', 'Microsoft India', 'Amazon India', 'Flipkart', 'Razorpay']
  let taskId = 1
  for (const agent of _aiAgents) {
    for (let i = 0; i < 5; i++) {
      _aiAgentTasks.push({
        id: `task-${String(taskId++).padStart(3, '0')}`,
        agentId: agent.id,
        type: taskTypes[i % taskTypes.length],
        status: taskStatuses[i % taskStatuses.length],
        priority: Math.floor(Math.random() * 3) + 1,
        targetEmail: `hr@${companies[i].toLowerCase().replace(/\s/g, '')}.com`,
        targetName: `HR Manager`,
        targetCompany: companies[i],
        targetUrl: `https://${companies[i].toLowerCase().replace(/\s/g, '')}.com/careers`,
        targetData: null,
        scheduledAt: new Date(now.getTime() - (i + 1) * 3600000).toISOString(),
        startedAt: taskStatuses[i % taskStatuses.length] !== 'PENDING' ? new Date(now.getTime() - i * 3600000).toISOString() : null,
        completedAt: ['COMPLETED', 'FAILED'].includes(taskStatuses[i % taskStatuses.length]) ? new Date(now.getTime() - (i - 1) * 3600000).toISOString() : null,
        result: taskStatuses[i % taskStatuses.length] === 'COMPLETED' ? 'Completed successfully' : null,
        error: taskStatuses[i % taskStatuses.length] === 'FAILED' ? 'Connection timeout' : null,
        retryCount: 0,
        requiresApproval: i % 3 === 0,
        approvedBy: i % 3 === 0 ? 'demo-admin-001' : null,
        approvedAt: i % 3 === 0 ? new Date(now.getTime() - i * 3600000).toISOString() : null,
        createdAt: new Date(now.getTime() - (i + 1) * 86400000).toISOString(),
        updatedAt: now.toISOString(),
      })
    }
  }

  // Seed AI Agent Emails (sample recent emails with contact details)
  const emailStatuses = ['SENT', 'DELIVERED', 'OPENED', 'REPLIED', 'SENT', 'BOUNCED']
  const emailContactDetails = [
    { toName: 'Rajesh Kumar', toDesignation: 'VP - Talent Acquisition', toPhone: '+91-22-6788-9999' },
    { toName: 'Priya Menon', toDesignation: 'Head - Global Talent Acquisition', toPhone: '+91-80-2852-0362' },
    { toName: 'Suresh Iyer', toDesignation: 'HR Director', toPhone: '+91-80-2852-0363' },
    { toName: 'Deepa Nair', toDesignation: 'Chief Human Resources Officer', toPhone: '+91-80-2839-9999' },
    { toName: 'Anita Sharma', toDesignation: 'Senior HR Manager', toPhone: '+91-22-6788-8888' },
    { toName: 'Vikram Rao', toDesignation: 'Talent Acquisition Lead', toPhone: '+91-80-2839-8888' },
  ]
  let emailId = 1
  for (const agent of _aiAgents) {
    for (let i = 0; i < 4; i++) {
      const status = emailStatuses[i % emailStatuses.length]
      const contact = emailContactDetails[(emailId - 1) % emailContactDetails.length]
      const companyDomain = companies[i].toLowerCase().replace(/\s/g, '')
      _aiAgentEmails.push({
        id: `email-${String(emailId++).padStart(3, '0')}`,
        agentId: agent.id,
        taskId: _aiAgentTasks.find(t => t.agentId === agent.id)?.id || null,
        toEmail: `hr@${companyDomain}.com`,
        toName: contact.toName,
        company: companies[i],
        subject: `Partnership Opportunity - 3 Boxes Jobs × ${companies[i]}`,
        body: `<p>Dear ${contact.toName},</p><p>I hope this email finds you well. I'm reaching out from 3 Boxes Jobs, India's fastest-growing AI-powered recruitment platform that connects top talent with leading companies like ${companies[i]}.</p><p>What makes us different:</p><ul><li>AI-powered candidate matching with 95%+ accuracy</li><li>Pre-screened candidates with verified skills</li><li>70% faster hiring process compared to traditional methods</li><li>Access to 50,000+ active job seekers across India</li></ul><p>I'd love to explore how 3 Boxes Jobs can streamline your hiring process at ${companies[i]}. Would you be available for a brief 15-minute call this week?</p><p>Looking forward to connecting!</p><p>Best regards,<br/>The 3 Boxes Jobs Team<br/>https://3boxesjobs.com</p>`,
        templateId: _aiEmailTemplates.find(t => t.agentType === agent.type)?.id || null,
        templateData: JSON.stringify({ companyName: companies[i], recipientName: contact.toName, recipientDesignation: contact.toDesignation, recipientPhone: contact.toPhone }),
        status,
        sentAt: status !== 'DRAFT' ? new Date(now.getTime() - (i + 1) * 7200000).toISOString() : null,
        deliveredAt: ['DELIVERED', 'OPENED', 'REPLIED'].includes(status) ? new Date(now.getTime() - i * 7200000).toISOString() : null,
        openedAt: ['OPENED', 'REPLIED'].includes(status) ? new Date(now.getTime() - i * 3600000).toISOString() : null,
        repliedAt: status === 'REPLIED' ? new Date(now.getTime() - i * 1800000).toISOString() : null,
        openCount: ['OPENED', 'REPLIED'].includes(status) ? Math.floor(Math.random() * 3) + 1 : 0,
        replyCount: status === 'REPLIED' ? 1 : 0,
        bouncedReason: status === 'BOUNCED' ? 'Mailbox full' : null,
        followUpSequence: i,
        nextFollowUpAt: i < 3 ? new Date(now.getTime() + (3 - i) * 86400000).toISOString() : null,
        parentEmailId: i > 0 ? `email-${String(emailId - 2).padStart(3, '0')}` : null,
        createdAt: new Date(now.getTime() - (i + 1) * 86400000).toISOString(),
        updatedAt: now.toISOString(),
      })
    }
  }

  // Seed AI Agent Daily Stats (last 7 days for each agent)
  const today7 = new Date()
  today7.setHours(0, 0, 0, 0)
  let statId = 1
  for (const agent of _aiAgents) {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today7)
      date.setDate(date.getDate() - i)
      _aiAgentDailyStats.push({
        id: `stat-${String(statId++).padStart(3, '0')}`,
        agentId: agent.id,
        date: date.toISOString(),
        tasksCreated: Math.floor(Math.random() * 5) + 1,
        tasksCompleted: Math.floor(Math.random() * 4),
        tasksFailed: Math.floor(Math.random() * 2),
        emailsSent: Math.floor(Math.random() * 15) + 5,
        emailsDelivered: Math.floor(Math.random() * 13) + 4,
        emailsOpened: Math.floor(Math.random() * 8) + 2,
        emailsReplied: Math.floor(Math.random() * 4),
        emailsBounced: Math.floor(Math.random() * 2),
        companiesScraped: agent.type === 'ADMIN_OUTREACH_COMPANY' ? Math.floor(Math.random() * 8) + 2 : 0,
        contactsFound: Math.floor(Math.random() * 6) + 1,
        jobsApplied: 0,
        interviewsScheduled: Math.floor(Math.random() * 2),
        onboardingsStarted: Math.floor(Math.random() * 2),
        onboardingsCompleted: Math.floor(Math.random()),
        deliveryRate: 0.85 + Math.random() * 0.12,
        openRate: 0.25 + Math.random() * 0.2,
        replyRate: 0.1 + Math.random() * 0.15,
        bounceRate: Math.random() * 0.08,
        conversionRate: 0.05 + Math.random() * 0.1,
      })
    }
  }

  // Seed Company Scrapes (with rich contact data)
  const companyDetails = [
    { name: 'TCS', location: 'Mumbai, India', size: '10000+', industry: 'Information Technology', hrName: 'Rajesh Kumar', hrDesignation: 'VP - Talent Acquisition', hrPhone: '+91-22-6788-9999', contactName: 'Anita Sharma', contactDesignation: 'Senior HR Manager', contactPhone: '+91-22-6788-8888', website: 'tcs.com' },
    { name: 'Infosys', location: 'Bangalore, India', size: '10000+', industry: 'Information Technology & Consulting', hrName: 'Priya Menon', hrDesignation: 'Head - Global Talent Acquisition', hrPhone: '+91-80-2852-0362', contactName: 'Suresh Iyer', contactDesignation: 'HR Director', contactPhone: '+91-80-2852-0363', website: 'infosys.com' },
    { name: 'Wipro', location: 'Bangalore, India', size: '10000+', industry: 'Information Technology & Consulting', hrName: 'Deepa Nair', hrDesignation: 'Chief Human Resources Officer', hrPhone: '+91-80-2839-9999', contactName: 'Vikram Rao', contactDesignation: 'Talent Acquisition Lead', contactPhone: '+91-80-2839-8888', website: 'wipro.com' },
    { name: 'HCL Technologies', location: 'Noida, India', size: '10001-50000', industry: 'Information Technology Services', hrName: 'Apparao V', hrDesignation: 'Global Head - HR', hrPhone: '+91-120-251-8001', contactName: 'Meena Reddy', contactDesignation: 'Recruitment Manager', contactPhone: '+91-120-251-8002', website: 'hcltech.com' },
    { name: 'Tech Mahindra', location: 'Pune, India', size: '10001-50000', industry: 'IT Services & Consulting', hrName: 'Harshvendra Soin', hrDesignation: 'Chief People Officer', hrPhone: '+91-20-6601-8999', contactName: 'Ritu Bhasin', contactDesignation: 'HR Business Partner', contactPhone: '+91-20-6601-8998', website: 'techmahindra.com' },
    { name: 'Google India', location: 'Bangalore, India', size: '10001-50000', industry: 'Internet & Technology', hrName: 'Aparna Chennapragada', hrDesignation: 'VP - People Operations', hrPhone: '+91-80-6721-8000', contactName: 'Karan Bajaj', contactDesignation: 'Senior Recruiter', contactPhone: '+91-80-6721-8001', website: 'google.co.in' },
    { name: 'Microsoft India', location: 'Hyderabad, India', size: '10001-50000', industry: 'Software & Cloud Computing', hrName: 'Ira Gupta', hrDesignation: 'Head - HR India', hrPhone: '+91-40-6629-8000', contactName: 'Nikhil Desai', contactDesignation: 'Talent Sourcing Manager', contactPhone: '+91-40-6629-8001', website: 'microsoft.com/en-in' },
    { name: 'Amazon India', location: 'Hyderabad, India', size: '10001-50000', industry: 'E-Commerce & Cloud', hrName: 'Raj Raghavan', hrDesignation: 'Director - HR India', hrPhone: '+91-40-6629-9000', contactName: 'Sneha Patel', contactDesignation: 'Recruiting Manager', contactPhone: '+91-40-6629-9001', website: 'amazon.in' },
    { name: 'Flipkart', location: 'Bangalore, India', size: '5001-10000', industry: 'E-Commerce', hrName: 'Krishna Raghavan', hrDesignation: 'Chief People Officer', hrPhone: '+91-80-6128-8000', contactName: 'Amit Joshi', contactDesignation: 'Senior Talent Acquisition', contactPhone: '+91-80-6128-8001', website: 'flipkart.com' },
    { name: 'Razorpay', location: 'Bangalore, India', size: '1001-5000', industry: 'Fintech & Payments', hrName: 'Chitra Sharma', hrDesignation: 'Head - People & Culture', hrPhone: '+91-80-6822-7000', contactName: 'Dev Prasad', contactDesignation: 'Talent Acquisition Lead', contactPhone: '+91-80-6822-7001', website: 'razorpay.com' },
  ]

  let scrapeId = 1
  for (let i = 0; i < companyDetails.length; i++) {
    const c = companyDetails[i]
    const statuses = ['scraped', 'contacted', 'responded', 'onboarded', 'pending', 'scraped', 'contacted', 'responded', 'pending', 'scraped']
    const domain = c.website
    _aiCompanyScrapes.push({
      id: `scrape-${String(scrapeId++).padStart(3, '0')}`,
      companyUrl: `https://${domain}`,
      companyName: c.name,
      careersPageUrl: `https://${domain}/careers`,
      contactEmail: `careers@${domain}`,
      hrEmail: `hr@${domain}`,
      linkedInUrl: `https://linkedin.com/company/${c.name.toLowerCase().replace(/\s/g, '-')}`,
      industry: c.industry,
      companySize: c.size,
      location: c.location,
      scrapeData: JSON.stringify({
        hrName: c.hrName,
        hrDesignation: c.hrDesignation,
        hrPhone: c.hrPhone,
        contactName: c.contactName,
        contactDesignation: c.contactDesignation,
        contactPhone: c.contactPhone,
        companyPhone: c.hrPhone,
        numberOfEmployees: c.size,
        foundedYear: c.name === 'TCS' ? 1968 : c.name === 'Infosys' ? 1981 : c.name === 'Wipro' ? 1945 : c.name === 'HCL Technologies' ? 1976 : c.name === 'Tech Mahindra' ? 1986 : c.name === 'Google India' ? 2004 : c.name === 'Microsoft India' ? 1990 : c.name === 'Amazon India' ? 2013 : c.name === 'Flipkart' ? 2007 : 2014,
        revenue: c.name === 'TCS' ? '$27B+' : c.name === 'Infosys' ? '$18B+' : c.name === 'Wipro' ? '$10B+' : c.name === 'HCL Technologies' ? '$12B+' : c.name === 'Tech Mahindra' ? '$6B+' : c.name === 'Google India' ? '$5B+' : c.name === 'Microsoft India' ? '$4B+' : c.name === 'Amazon India' ? '$3B+' : c.name === 'Flipkart' ? '$2B+' : '$500M+',
        techStack: ['Java', 'Python', 'React', 'Node.js', 'AWS', 'Azure', 'Kubernetes'].slice(0, 3 + Math.floor(Math.random() * 4)).join(', '),
        openPositions: Math.floor(Math.random() * 200) + 10,
      }),
      status: statuses[i],
      lastScrapedAt: new Date(now.getTime() - i * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - (i + 3) * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    })
  }

  _initialized = true
}

// Initialize on first import
seedMemoryData()

// ─── Memory Store API ──────────────────────────────────────────

export const memoryStore = {
  // Check if Prisma DB is available (with timeout to prevent hanging on Vercel)
  // On Vercel (VERCEL env var set), skip Prisma entirely — SQLite doesn't work there
  async isDbAvailable(): Promise<boolean> {
    // Skip Prisma on Vercel — SQLite is incompatible with serverless
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      _dbAvailable = false
      return false
    }
    if (_dbAvailable) return true
    try {
      const dbModule = await Promise.race([
        import('./db'),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('DB import timeout')), 3000))
      ]) as any
      if (!dbModule?.db) { _dbAvailable = false; return false }
      await Promise.race([
        dbModule.db.user.count(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('DB query timeout')), 3000))
      ])
      _dbAvailable = true
      return true
    } catch {
      _dbAvailable = false
      return false
    }
  },

  // ─── Auth ──────────────────────────────────────────

  async login(email: string, password: string) {
    // Try Prisma first if available
    if (await this.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('./db')
        await ensureSeedData()
        const user = await db.user.findUnique({ where: { email } })
        if (!user) return { error: 'Invalid email or password', status: 401 }
        if (!verifyPassword(password, user.password)) return { error: 'Invalid email or password', status: 401 }
        if (!user.isActive) return { error: 'Account is deactivated', status: 403 }

        const token = generateToken()
        let profile = null
        try {
          switch (user.role) {
            case 'JOB_SEEKER': profile = await db.jobSeekerProfile.findUnique({ where: { userId: user.id } }); break
            case 'CORPORATE': profile = await db.corporateProfile.findUnique({ where: { userId: user.id } }); break
            case 'RECRUITER': profile = await db.recruiterProfile.findUnique({ where: { userId: user.id } }); break
          }
        } catch { /* profile fetch failed, continue without profile */ }

        return {
          user: {
            id: user.id, email: user.email, name: user.name, role: user.role,
            avatar: user.avatar, phone: user.phone, location: user.location,
            profile,
          },
          token,
        }
      } catch (error) {
        console.error('Prisma login failed, falling back to memory:', error)
        _dbAvailable = false // Mark as unavailable for future requests
      }
    }

    // Fallback to memory store
    const user = _users.find(u => u.email === email)
    if (!user) return { error: 'Invalid email or password', status: 401 }
    if (!verifyPassword(password, user.password)) return { error: 'Invalid email or password', status: 401 }
    if (!user.isActive) return { error: 'Account is deactivated', status: 403 }

    const token = generateToken()
    let profile = null
    switch (user.role) {
      case 'JOB_SEEKER': profile = user.jobSeekerProfile || null; break
      case 'CORPORATE': profile = user.corporateProfile || null; break
      case 'RECRUITER': profile = user.recruiterProfile || null; break
    }

    return {
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        avatar: user.avatar, phone: user.phone, location: user.location,
        profile,
      },
      token,
    }
  },

  async register(data: {
    email: string
    password: string
    name: string
    role: string
    companyName?: string
    industry?: string
    companySize?: string
    specialization?: string
    phone?: string
    location?: string
  }) {
    // Try Prisma first if available
    if (await this.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('./db')
        await ensureSeedData()
        const existing = await db.user.findUnique({ where: { email: data.email } })
        if (existing) return { error: 'Email already registered', status: 409 }

        const hashedPassword = hashPassword(data.password)
        const user = await db.user.create({
          data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            role: data.role as any,
            phone: data.phone || null,
            location: data.location || null,
            ...(data.role === 'JOB_SEEKER' && {
              jobSeekerProfile: { create: { headline: 'Looking for new opportunities' } },
            }),
            ...(data.role === 'CORPORATE' && {
              corporateProfile: {
                create: {
                  companyName: data.companyName || `${data.name}'s Company`,
                  industry: data.industry || null,
                  companySize: data.companySize || null,
                },
              },
            }),
            ...(data.role === 'RECRUITER' && {
              recruiterProfile: { create: { specialization: data.specialization || null } },
            }),
          },
          include: {
            jobSeekerProfile: true,
            corporateProfile: true,
            recruiterProfile: true,
          },
        })

        return {
          user: {
            id: user.id, email: user.email, name: user.name, role: user.role,
            avatar: user.avatar, phone: user.phone, location: user.location,
          },
          message: 'Registration successful',
          status: 201,
        }
      } catch (error) {
        console.error('Prisma register failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }

    // Fallback to memory store
    const existing = _users.find(u => u.email === data.email)
    if (existing) return { error: 'Email already registered', status: 409 }

    const hashedPassword = hashPassword(data.password)
    const id = genId()
    const newUser: UserRecord = {
      id,
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role as any,
      phone: data.phone,
      location: data.location,
      isActive: true,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (data.role === 'JOB_SEEKER') {
      newUser.jobSeekerProfile = {
        id: genId(), userId: id, headline: 'Looking for new opportunities',
        experienceYears: 0, profileComplete: 10, aiSkillScore: 0,
      }
    } else if (data.role === 'CORPORATE') {
      newUser.corporateProfile = {
        id: genId(), userId: id,
        companyName: data.companyName || `${data.name}'s Company`,
        industry: data.industry, companySize: data.companySize,
        isVerified: false,
      }
    } else if (data.role === 'RECRUITER') {
      newUser.recruiterProfile = {
        id: genId(), userId: id,
        specialization: data.specialization,
        yearsExperience: 0, placementCount: 0, rating: 0,
      }
    }

    _users.push(newUser)

    return {
      user: {
        id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role,
        avatar: newUser.avatar, phone: newUser.phone, location: newUser.location,
      },
      message: 'Registration successful',
      status: 201,
    }
  },

  // ─── Jobs ──────────────────────────────────────────

  async getJobs(filters: {
    search?: string
    jobType?: string
    location?: string
    experienceMin?: string
    isRemote?: string
    skills?: string
    page?: number
    limit?: number
  }) {
    const { search = '', jobType, location, experienceMin, isRemote, skills, page = 1, limit = 10 } = filters

    // Try Prisma first if available
    if (await this.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('./db')
        await ensureSeedData()

        const where: any = { status: 'ACTIVE' }
        if (search) {
          where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
            { skills: { contains: search } },
            { location: { contains: search } },
          ]
        }
        if (jobType && jobType !== 'all') where.jobType = jobType
        if (location) where.location = { contains: location }
        if (isRemote === 'true') where.isRemote = true
        if (experienceMin) where.experienceMin = { lte: parseInt(experienceMin) }
        if (skills) where.skills = { contains: skills }

        const total = await db.job.count({ where })
        const jobs = await db.job.findMany({
          where,
          include: {
            corporate: {
              select: { id: true, companyName: true, companyLogo: true, industry: true, location: true },
            },
          },
          orderBy: { postedDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        })

        return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) }
      } catch (error) {
        console.error('Prisma getJobs failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }

    // Fallback to memory store
    let filtered = _jobs.filter(j => j.status === 'ACTIVE')

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(s) ||
        j.description.toLowerCase().includes(s) ||
        (j.skills || '').toLowerCase().includes(s) ||
        (j.location || '').toLowerCase().includes(s)
      )
    }
    if (jobType && jobType !== 'all') filtered = filtered.filter(j => j.jobType === jobType)
    if (location) filtered = filtered.filter(j => (j.location || '').toLowerCase().includes(location.toLowerCase()))
    if (isRemote === 'true') filtered = filtered.filter(j => j.isRemote)
    if (experienceMin) filtered = filtered.filter(j => !j.experienceMin || j.experienceMin <= parseInt(experienceMin))
    if (skills) filtered = filtered.filter(j => (j.skills || '').toLowerCase().includes(skills.toLowerCase()))

    const total = filtered.length
    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)

    return { jobs: paged, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getJobById(id: string) {
    // Try Prisma first if available
    if (await this.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('./db')
        await ensureSeedData()
        const job = await db.job.findUnique({
          where: { id },
          include: {
            corporate: {
              select: { id: true, companyName: true, companyLogo: true, industry: true, location: true, website: true, description: true, companySize: true, isVerified: true },
            },
          },
        })
        if (job) return { job }
      } catch (error) {
        console.error('Prisma getJobById failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }

    // Fallback to memory store
    const job = _jobs.find(j => j.id === id)
    if (!job) return { error: 'Job not found', status: 404 }
    return { job }
  },

  // ─── Courses ──────────────────────────────────────────

  async getCourses(filters: { category?: string; level?: string; search?: string }) {
    // Try Prisma first if available
    if (await this.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('./db')
        await ensureSeedData()
        const where: any = { isActive: true }
        if (filters.category) where.category = filters.category
        if (filters.level) where.level = filters.level
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
            { skills: { contains: filters.search } },
          ]
        }
        const courses = await db.trainingCourse.findMany({ where, orderBy: { rating: 'desc' } })
        return { courses }
      } catch (error) {
        console.error('Prisma getCourses failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }

    // Fallback to memory store
    let filtered = _courses.filter(c => c.isActive)
    if (filters.category) filtered = filtered.filter(c => c.category === filters.category)
    if (filters.level) filtered = filtered.filter(c => c.level === filters.level)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        (c.skills || '').toLowerCase().includes(s)
      )
    }
    return { courses: filtered }
  },

  // ─── User profile ──────────────────────────────────────

  async getUserProfile(userId: string) {
    // Try Prisma first if available
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        const user = await db.user.findUnique({
          where: { id: userId },
          include: {
            jobSeekerProfile: true,
            corporateProfile: true,
            recruiterProfile: true,
          },
        })
        if (user) return { user }
      } catch (error) {
        console.error('Prisma getUserProfile failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }

    // Fallback to memory store
    const user = _users.find(u => u.id === userId)
    if (!user) return { error: 'User not found', status: 404 }
    return {
      user: {
        ...user,
        profile: user.jobSeekerProfile || user.corporateProfile || user.recruiterProfile || null,
      },
    }
  },

  // ─── AI Agents ──────────────────────────────────────────

  async getAgents(typeFilter?: string) {
    if (await this.isDbAvailable()) {
      try {
        const { ensureSeedData } = await import('./db')
        await ensureSeedData()
        const { db } = await import('./db')
        const where: any = {}
        if (typeFilter) where.type = typeFilter
        const agents = await db.aIAgent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { tasks: true, emails: true } },
            stats: { orderBy: { date: 'desc' }, take: 1 },
          },
        })
        return agents.map((a: any) => ({
          ...a, taskCount: a._count?.tasks || 0, emailCount: a._count?.emails || 0,
          todayStats: a.stats?.[0] || null,
        }))
      } catch (error) {
        console.error('Prisma getAgents failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }
    // Memory fallback
    let agents = _aiAgents
    if (typeFilter) agents = agents.filter(a => a.type === typeFilter)
    return agents.map(a => ({
      ...a,
      taskCount: _aiAgentTasks.filter(t => t.agentId === a.id).length,
      emailCount: _aiAgentEmails.filter(e => e.agentId === a.id).length,
      todayStats: _aiAgentDailyStats.find(s => s.agentId === a.id && new Date(s.date).toDateString() === new Date().toDateString()) || null,
    }))
  },

  async createAgent(data: { name: string; type: string; description?: string; strategy?: any; dailyLimit?: number; createdBy: string }) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        const agent = await db.aIAgent.create({
          data: {
            name: data.name, type: data.type, description: data.description || null,
            strategy: data.strategy ? JSON.stringify(data.strategy) : null,
            dailyLimit: data.dailyLimit || 50, createdBy: data.createdBy,
            status: 'ACTIVE', dailyResetAt: new Date(),
          },
        })
        return agent
      } catch (error) {
        console.error('Prisma createAgent failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }
    // Memory fallback
    const agent = {
      id: genId(), ...data, status: 'ACTIVE', dailySent: 0,
      totalTasks: 0, totalSuccess: 0, totalFailed: 0, totalEmailsSent: 0,
      totalResponses: 0, totalConversions: 0, avgResponseRate: 0,
      lastRunAt: null, dailyResetAt: new Date().toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    _aiAgents.push(agent)
    return agent
  },

  async updateAgent(id: string, data: any) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        return await db.aIAgent.update({ where: { id }, data })
      } catch (error) {
        console.error('Prisma updateAgent failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }
    const idx = _aiAgents.findIndex(a => a.id === id)
    if (idx >= 0) { _aiAgents[idx] = { ..._aiAgents[idx], ...data, updatedAt: new Date().toISOString() }; return _aiAgents[idx] }
    return null
  },

  async deleteAgent(id: string) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        await db.aIAgent.delete({ where: { id } })
        return true
      } catch (error) {
        console.error('Prisma deleteAgent failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }
    _aiAgents = _aiAgents.filter(a => a.id !== id)
    _aiAgentTasks = _aiAgentTasks.filter(t => t.agentId !== id)
    _aiAgentEmails = _aiAgentEmails.filter(e => e.agentId !== id)
    _aiAgentDailyStats = _aiAgentDailyStats.filter(s => s.agentId !== id)
    return true
  },

  async getAgentDashboard() {
    if (await this.isDbAvailable()) {
      try {
        const { ensureSeedData } = await import('./db')
        await ensureSeedData()
        const res = await fetch('/api/agents/dashboard')
        if (res.ok) return await res.json()
      } catch (error) {
        console.error('Prisma agentDashboard failed, falling back to memory:', error)
        _dbAvailable = false
      }
    }
    // Memory fallback - compute dashboard data
    const agents = _aiAgents
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayStats = _aiAgentDailyStats.filter(s => new Date(s.date).toDateString() === today.toDateString())
    const todayAggregate = todayStats.reduce((acc, s) => ({
      emailsSent: acc.emailsSent + s.emailsSent, emailsDelivered: acc.emailsDelivered + s.emailsDelivered,
      emailsOpened: acc.emailsOpened + s.emailsOpened, emailsReplied: acc.emailsReplied + s.emailsReplied,
      emailsBounced: acc.emailsBounced + s.emailsBounced, tasksCreated: acc.tasksCreated + s.tasksCreated,
      tasksCompleted: acc.tasksCompleted + s.tasksCompleted, tasksFailed: acc.tasksFailed + s.tasksFailed,
      companiesScraped: acc.companiesScraped + s.companiesScraped, contactsFound: acc.contactsFound + s.contactsFound,
      jobsApplied: acc.jobsApplied + s.jobsApplied, interviewsScheduled: acc.interviewsScheduled + s.interviewsScheduled,
      onboardingsStarted: acc.onboardingsStarted + s.onboardingsStarted, onboardingsCompleted: acc.onboardingsCompleted + s.onboardingsCompleted,
    }), { emailsSent: 0, emailsDelivered: 0, emailsOpened: 0, emailsReplied: 0, emailsBounced: 0, tasksCreated: 0, tasksCompleted: 0, tasksFailed: 0, companiesScraped: 0, contactsFound: 0, jobsApplied: 0, interviewsScheduled: 0, onboardingsStarted: 0, onboardingsCompleted: 0 })

    const overallTotals = agents.reduce((acc, a) => ({
      totalTasks: acc.totalTasks + a.totalTasks, totalSuccess: acc.totalSuccess + a.totalSuccess,
      totalFailed: acc.totalFailed + a.totalFailed, totalEmailsSent: acc.totalEmailsSent + a.totalEmailsSent,
      totalResponses: acc.totalResponses + a.totalResponses, totalConversions: acc.totalConversions + a.totalConversions,
    }), { totalTasks: 0, totalSuccess: 0, totalFailed: 0, totalEmailsSent: 0, totalResponses: 0, totalConversions: 0 })

    const agentTypeBreakdown: any = {}
    for (const agent of agents) {
      if (!agentTypeBreakdown[agent.type]) agentTypeBreakdown[agent.type] = { count: 0, totalEmailsSent: 0, totalResponses: 0, totalConversions: 0, totalTasks: 0, totalSuccess: 0, avgResponseRate: 0, activeCount: 0 }
      const b = agentTypeBreakdown[agent.type]
      b.count++; b.totalEmailsSent += agent.totalEmailsSent; b.totalResponses += agent.totalResponses
      b.totalConversions += agent.totalConversions; b.totalTasks += agent.totalTasks; b.totalSuccess += agent.totalSuccess
      if (agent.status === 'ACTIVE') b.activeCount++
      if (b.totalEmailsSent > 0) b.avgResponseRate = b.totalResponses / b.totalEmailsSent
    }

    // Build activity feed
    const activityFeed = [
      ..._aiAgentTasks.slice(0, 10).map(t => {
        const agent = agents.find(a => a.id === t.agentId)
        return { id: t.id, type: 'task' as const, taskType: t.type, agentId: t.agentId, agentName: agent?.name || '', agentType: agent?.type || '', status: t.status, target: t.targetCompany || 'N/A', createdAt: t.createdAt, completedAt: t.completedAt }
      }),
      ..._aiAgentEmails.slice(0, 10).map(e => {
        const agent = agents.find(a => a.id === e.agentId)
        return { id: e.id, type: 'email' as const, taskType: 'email', agentId: e.agentId, agentName: agent?.name || '', agentType: agent?.type || '', status: e.status, target: e.company || e.toName || e.toEmail, subject: e.subject, createdAt: e.createdAt, sentAt: e.sentAt }
      }),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20)

    const overallRates = {
      responseRate: overallTotals.totalEmailsSent > 0 ? overallTotals.totalResponses / overallTotals.totalEmailsSent : 0,
      conversionRate: overallTotals.totalResponses > 0 ? overallTotals.totalConversions / overallTotals.totalResponses : 0,
      taskSuccessRate: overallTotals.totalTasks > 0 ? overallTotals.totalSuccess / overallTotals.totalTasks : 0,
      todayDeliveryRate: todayAggregate.emailsSent > 0 ? todayAggregate.emailsDelivered / todayAggregate.emailsSent : 0,
      todayOpenRate: todayAggregate.emailsDelivered > 0 ? todayAggregate.emailsOpened / todayAggregate.emailsDelivered : 0,
      todayReplyRate: todayAggregate.emailsOpened > 0 ? todayAggregate.emailsReplied / todayAggregate.emailsOpened : 0,
      todayBounceRate: todayAggregate.emailsSent > 0 ? todayAggregate.emailsBounced / todayAggregate.emailsSent : 0,
    }

    return {
      overview: { totalAgents: agents.length, activeAgents: agents.filter(a => a.status === 'ACTIVE').length, pausedAgents: agents.filter(a => a.status === 'PAUSED').length, stoppedAgents: agents.filter(a => a.status === 'STOPPED').length, errorAgents: agents.filter(a => a.status === 'ERROR').length },
      todayMetrics: todayAggregate, overallTotals, overallRates, agentTypeBreakdown,
      agents: agents.map(a => ({ ...a, taskCount: _aiAgentTasks.filter(t => t.agentId === a.id).length, emailCount: _aiAgentEmails.filter(e => e.agentId === a.id).length, todayStats: _aiAgentDailyStats.find(s => s.agentId === a.id && new Date(s.date).toDateString() === new Date().toDateString()) || null })),
      activityFeed,
    }
  },

  async getAgentTasks(agentId: string, limit?: number) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        const tasks = await db.aIAgentTask.findMany({ where: { agentId }, orderBy: { createdAt: 'desc' }, take: limit || 50 })
        return tasks
      } catch (error) { _dbAvailable = false }
    }
    let tasks = _aiAgentTasks.filter(t => t.agentId === agentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (limit) tasks = tasks.slice(0, limit)
    return tasks
  },

  async createAgentTask(agentId: string, data: any) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        return await db.aIAgentTask.create({ data: { agentId, ...data } })
      } catch (error) { _dbAvailable = false }
    }
    const task = { id: genId(), agentId, ...data, retryCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    _aiAgentTasks.unshift(task)
    return task
  },

  async getAgentEmails(agentId: string, limit?: number) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        const emails = await db.aIAgentEmail.findMany({ where: { agentId }, orderBy: { createdAt: 'desc' }, take: limit || 50 })
        return emails
      } catch (error) { _dbAvailable = false }
    }
    let emails = _aiAgentEmails.filter(e => e.agentId === agentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (limit) emails = emails.slice(0, limit)
    return emails
  },

  async createAgentEmail(agentId: string, data: any) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        return await db.aIAgentEmail.create({ data: { agentId, ...data } })
      } catch (error) { _dbAvailable = false }
    }
    const email = { id: genId(), agentId, ...data, openCount: 0, replyCount: 0, followUpSequence: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    _aiAgentEmails.unshift(email)
    return email
  },

  async getAgentStats(agentId: string) {
    if (await this.isDbAvailable()) {
      try {
        const res = await fetch(`/api/agents/${agentId}/stats`)
        if (res.ok) return await res.json()
      } catch (error) { _dbAvailable = false }
    }
    const agent = _aiAgents.find(a => a.id === agentId)
    if (!agent) return null
    const dailyStats = _aiAgentDailyStats.filter(s => s.agentId === agentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const aggregate = dailyStats.reduce((acc, s) => ({
      emailsSent: acc.emailsSent + s.emailsSent, emailsDelivered: acc.emailsDelivered + s.emailsDelivered,
      emailsOpened: acc.emailsOpened + s.emailsOpened, emailsReplied: acc.emailsReplied + s.emailsReplied,
      emailsBounced: acc.emailsBounced + s.emailsBounced, tasksCreated: acc.tasksCreated + s.tasksCreated,
      tasksCompleted: acc.tasksCompleted + s.tasksCompleted, tasksFailed: acc.tasksFailed + s.tasksFailed,
      companiesScraped: acc.companiesScraped + s.companiesScraped, contactsFound: acc.contactsFound + s.contactsFound,
      jobsApplied: acc.jobsApplied + s.jobsApplied, interviewsScheduled: acc.interviewsScheduled + s.interviewsScheduled,
      onboardingsStarted: acc.onboardingsStarted + s.onboardingsStarted, onboardingsCompleted: acc.onboardingsCompleted + s.onboardingsCompleted,
    }), { emailsSent: 0, emailsDelivered: 0, emailsOpened: 0, emailsReplied: 0, emailsBounced: 0, tasksCreated: 0, tasksCompleted: 0, tasksFailed: 0, companiesScraped: 0, contactsFound: 0, jobsApplied: 0, interviewsScheduled: 0, onboardingsStarted: 0, onboardingsCompleted: 0 })
    const last30 = dailyStats.slice(0, 30)
    const r30 = { deliveryRate: 0, openRate: 0, replyRate: 0, bounceRate: 0, conversionRate: 0, taskSuccessRate: 0 }
    if (last30.length > 0) {
      r30.deliveryRate = last30.reduce((a, s) => a + s.deliveryRate, 0) / last30.length
      r30.openRate = last30.reduce((a, s) => a + s.openRate, 0) / last30.length
      r30.replyRate = last30.reduce((a, s) => a + s.replyRate, 0) / last30.length
      r30.bounceRate = last30.reduce((a, s) => a + s.bounceRate, 0) / last30.length
      r30.conversionRate = last30.reduce((a, s) => a + s.conversionRate, 0) / last30.length
      r30.taskSuccessRate = aggregate.tasksCreated > 0 ? aggregate.tasksCompleted / aggregate.tasksCreated : 0
    }
    return {
      agentId, agentName: agent.name, agentType: agent.type, dailyStats,
      aggregate,
      last30DayRates: r30,
      overallSummary: { totalTasks: agent.totalTasks, totalSuccess: agent.totalSuccess, totalFailed: agent.totalFailed, totalEmailsSent: agent.totalEmailsSent, totalResponses: agent.totalResponses, totalConversions: agent.totalConversions, avgResponseRate: agent.avgResponseRate, dailyLimit: agent.dailyLimit, dailySent: agent.dailySent, lastRunAt: agent.lastRunAt, status: agent.status },
      taskStatusBreakdown: Object.entries(_aiAgentTasks.filter(t => t.agentId === agentId).reduce((acc: any, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {})).map(([status, count]) => ({ status, count: count as number })),
      emailStatusBreakdown: Object.entries(_aiAgentEmails.filter(e => e.agentId === agentId).reduce((acc: any, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc }, {})).map(([status, count]) => ({ status, count: count as number })),
    }
  },

  async getEmailTemplates(agentType?: string) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        const where: any = { isActive: true }
        if (agentType) where.agentType = agentType
        return await db.aIEmailTemplate.findMany({ where, orderBy: { createdAt: 'desc' } })
      } catch (error) { _dbAvailable = false }
    }
    let templates = _aiEmailTemplates.filter(t => t.isActive)
    if (agentType) templates = templates.filter(t => t.agentType === agentType)
    return templates
  },

  async createEmailTemplate(data: any) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        return await db.aIEmailTemplate.create({ data: { ...data, isActive: true } })
      } catch (error) { _dbAvailable = false }
    }
    const template = { id: genId(), ...data, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    _aiEmailTemplates.push(template)
    return template
  },

  async getCompanyScrapes() {
    return _aiCompanyScrapes
  },

  async approveTasks(agentId: string, taskIds: string[]) {
    if (await this.isDbAvailable()) {
      try {
        const { db } = await import('./db')
        await db.aIAgentTask.updateMany({ where: { id: { in: taskIds }, agentId }, data: { status: 'APPROVED', approvedAt: new Date() } })
        return true
      } catch (error) { _dbAvailable = false }
    }
    for (const tid of taskIds) {
      const task = _aiAgentTasks.find(t => t.id === tid && t.agentId === agentId)
      if (task) { task.status = 'APPROVED'; task.approvedAt = new Date().toISOString() }
    }
    return true
  },

  async runAgent(agentId: string) {
    // Simulate agent run
    const agent = _aiAgents.find(a => a.id === agentId)
    if (!agent) return { error: 'Agent not found' }
    agent.lastRunAt = new Date().toISOString()
    agent.dailySent = Math.min(agent.dailySent + 1, agent.dailyLimit)
    return { message: 'Agent run triggered', agentId }
  },

  async scrapeCompany(url: string) {
    // Simulated scrape with rich contact data
    const domain = url.replace(/https?:\/\//, '').split('/')[0]
    const name = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    const firstNames = ['Rajesh', 'Priya', 'Suresh', 'Anita', 'Vikram', 'Deepa', 'Amit', 'Sneha', 'Karan', 'Meena']
    const lastNames = ['Kumar', 'Sharma', 'Iyer', 'Nair', 'Rao', 'Reddy', 'Joshi', 'Patel', 'Desai', 'Bhasin']
    const designations = ['HR Manager', 'Talent Acquisition Lead', 'VP - Human Resources', 'Director - People Operations', 'Chief People Officer']
    const seed = domain.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const contactName = `${firstNames[seed % firstNames.length]} ${lastNames[(seed + 3) % lastNames.length]}`
    const hrName = `${firstNames[(seed + 1) % firstNames.length]} ${lastNames[(seed + 2) % lastNames.length]}`
    const designation = designations[seed % designations.length]
    const areaCode = ['22', '80', '40', '20', '120'][seed % 5]
    const phone = `+91-${areaCode}-${1000 + seed}-${5000 + seed}`

    const scrapeData = {
      hrName,
      hrDesignation: designation,
      hrPhone: phone,
      contactName,
      contactDesignation: designation === 'Chief People Officer' ? 'Senior HR Manager' : 'Recruitment Coordinator',
      contactPhone: `+91-${areaCode}-${1000 + seed}-${5001 + seed}`,
      companyPhone: phone,
      numberOfEmployees: ['501-1000', '1001-5000', '5001-10000', '10000+'][seed % 4],
      foundedYear: 2000 + (seed % 24),
      revenue: ['$10M+', '$50M+', '$100M+', '$500M+', '$1B+'][seed % 5],
      techStack: ['Java', 'Python', 'React', 'Node.js', 'AWS', 'Azure', 'Kubernetes'].slice(0, 3 + (seed % 4)).join(', '),
      openPositions: 5 + (seed % 50),
    }

    const scrape = {
      id: genId(),
      companyUrl: url,
      companyName: name,
      careersPageUrl: `${url}/careers`,
      contactEmail: `careers@${domain}`,
      hrEmail: `hr@${domain}`,
      linkedInUrl: `https://linkedin.com/company/${domain.split('.')[0]}`,
      industry: ['Technology', 'IT Services', 'Consulting', 'E-Commerce', 'Fintech'][seed % 5],
      companySize: scrapeData.numberOfEmployees,
      location: ['Bangalore, India', 'Mumbai, India', 'Hyderabad, India', 'Pune, India', 'Delhi, India'][seed % 5],
      scrapeData: JSON.stringify(scrapeData),
      status: 'scraped',
      lastScrapedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to scrapes list
    const existing = _aiCompanyScrapes.findIndex(c => c.companyUrl === url)
    if (existing >= 0) {
      _aiCompanyScrapes[existing] = scrape
    } else {
      _aiCompanyScrapes.unshift(scrape)
    }

    return scrape
  },

  // ─── Resume Processing & Candidate Creation ──────────────────

  // Store for uploaded candidates (pending and processed)
  _uploadedCandidates: [] as any[],

  async processResumeUpload(agentId: string, candidates: any[]) {
    const agent = _aiAgents.find(a => a.id === agentId)
    if (!agent) return { error: 'Agent not found' }

    const results: any[] = []
    const defaultPassword = 'demo123'

    for (const candidate of candidates) {
      try {
        // Check if candidate email already exists
        const existingUser = _users.find(u => u.email === candidate.email)
        if (existingUser) {
          results.push({
            ...candidate,
            status: 'duplicate',
            message: `Candidate with email ${candidate.email} already exists`,
          })
          continue
        }

        // Create user account
        const userId = genId()
        const hashedPw = hashPassword(defaultPassword)
        const newUser: UserRecord = {
          id: userId,
          email: candidate.email,
          name: candidate.name || 'Unknown Candidate',
          password: hashedPw,
          role: 'JOB_SEEKER',
          phone: candidate.phone || null,
          location: candidate.location || null,
          bio: candidate.summary || null,
          isActive: true,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          jobSeekerProfile: {
            id: genId(),
            userId,
            headline: candidate.headline || candidate.title || '',
            experienceYears: candidate.experienceYears || 0,
            currentRole: candidate.title || '',
            currentCompany: candidate.company || '',
            education: candidate.education || '',
            expectedSalary: candidate.expectedSalary || '',
            jobType: candidate.jobType || 'full-time',
            availability: candidate.availability || 'immediate',
            skills: candidate.skills || '',
            linkedInUrl: candidate.linkedIn || '',
            aiSkillScore: Math.floor(Math.random() * 30) + 50,
            profileComplete: candidate.skills ? 75 : 40,
          },
        }
        _users.push(newUser)

        // Create task for this upload
        const task = {
          id: genId(),
          agentId,
          type: 'upload_resume',
          status: 'COMPLETED' as const,
          priority: 5,
          targetEmail: candidate.email,
          targetName: candidate.name,
          targetCompany: candidate.company || null,
          targetData: JSON.stringify(candidate),
          result: JSON.stringify({ userId, created: true, welcomeEmailSent: true }),
          requiresApproval: false,
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        _aiAgentTasks.unshift(task)

        // Create welcome email
        const welcomeEmail = {
          id: genId(),
          agentId,
          taskId: task.id,
          toEmail: candidate.email,
          toName: candidate.name,
          company: candidate.company || null,
          subject: `Welcome to 3 Boxes Jobs! Your Account is Ready | Login Details Inside`,
          body: `<p>Hi ${candidate.name},</p><p>Welcome to 3 Boxes Jobs - India's AI-Powered Recruitment Platform!</p><p>Your account has been created and you can now access our platform to:</p><ul><li>Get AI-matched job recommendations based on your profile</li><li>Apply to 10,000+ jobs from top companies across India</li><li>Track your applications in real-time</li><li>Build your resume with our AI Resume Builder</li><li>Practice interviews with AI Mock Interviews</li></ul><p><strong>Your Login Details:</strong></p><p>Email: ${candidate.email}<br/>Password: ${defaultPassword}</p><p>Login Now: https://3boxesjobs.com/login</p><p><em>Important: Please change your password after your first login for security.</em></p><p>We've already set up your profile based on your resume. You can review and update it anytime from your dashboard.</p><p>Best regards,<br/>The 3 Boxes Jobs Team</p>`,
          templateId: _aiEmailTemplates.find(t => t.agentType === 'ADMIN_DATA_ENTRY')?.id || null,
          templateData: JSON.stringify({ recipientName: candidate.name, recipientEmail: candidate.email, tempPassword: defaultPassword, portalUrl: 'https://3boxesjobs.com' }),
          status: 'SENT',
          sentAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          openCount: 0,
          replyCount: 0,
          followUpSequence: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        _aiAgentEmails.unshift(welcomeEmail)

        // Update agent stats
        agent.totalTasks++
        agent.totalSuccess++
        agent.totalEmailsSent++
        agent.dailySent = Math.min(agent.dailySent + 1, agent.dailyLimit)

        results.push({
          ...candidate,
          status: 'created',
          userId,
          email: candidate.email,
          tempPassword: defaultPassword,
          welcomeEmailSent: true,
          message: `Candidate created successfully. Welcome email sent to ${candidate.email}`,
        })
      } catch (error: any) {
        results.push({
          ...candidate,
          status: 'error',
          message: error.message || 'Failed to create candidate',
        })
        agent.totalTasks++
        agent.totalFailed++
      }
    }

    // Store uploaded candidates for UI display
    ;(this as any)._uploadedCandidates = [...results, ...((this as any)._uploadedCandidates || [])]

    agent.lastRunAt = new Date().toISOString()

    return {
      totalProcessed: candidates.length,
      created: results.filter(r => r.status === 'created').length,
      duplicates: results.filter(r => r.status === 'duplicate').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    }
  },

  async getUploadedCandidates() {
    return (this as any)._uploadedCandidates || []
  },

  // Get all users, optionally filtered by role
  async getUsers(role?: string, search?: string): Promise<any[]> {
    let users = _users.map(u => {
      const { password, ...safe } = u
      return safe
    })
    if (role) {
      users = users.filter(u => u.role === role)
    }
    if (search) {
      const q = search.toLowerCase()
      users = users.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.jobSeekerProfile?.skills?.toLowerCase().includes(q) ||
        u.jobSeekerProfile?.headline?.toLowerCase().includes(q) ||
        u.jobSeekerProfile?.currentRole?.toLowerCase().includes(q) ||
        u.jobSeekerProfile?.currentCompany?.toLowerCase().includes(q)
      )
    }
    return users
  },

  // Get all candidates (JOB_SEEKER role users) with their profiles
  async getCandidates(search?: string, skills?: string, location?: string, experienceMin?: number, experienceMax?: number): Promise<any[]> {
    let candidates = _users
      .filter(u => u.role === 'JOB_SEEKER' && u.isActive)
      .map(u => {
        const { password, ...safe } = u
        return {
          ...safe,
          // Flatten jobSeekerProfile for easy access
          headline: u.jobSeekerProfile?.headline || '',
          currentRole: u.jobSeekerProfile?.currentRole || '',
          currentCompany: u.jobSeekerProfile?.currentCompany || '',
          skills: u.jobSeekerProfile?.skills || '',
          experienceYears: u.jobSeekerProfile?.experienceYears || 0,
          education: u.jobSeekerProfile?.education || '',
          expectedSalary: u.jobSeekerProfile?.expectedSalary || '',
          jobType: u.jobSeekerProfile?.jobType || 'full-time',
          availability: u.jobSeekerProfile?.availability || 'immediate',
          linkededInUrl: u.jobSeekerProfile?.linkedInUrl || '',
          aiSkillScore: u.jobSeekerProfile?.aiSkillScore || 0,
          profileComplete: u.jobSeekerProfile?.profileComplete || 0,
        }
      })

    if (search) {
      const q = search.toLowerCase()
      candidates = candidates.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.headline?.toLowerCase().includes(q) ||
        c.currentRole?.toLowerCase().includes(q) ||
        c.currentCompany?.toLowerCase().includes(q)
      )
    }
    if (skills) {
      const skillList = skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
      candidates = candidates.filter(c =>
        skillList.some(s => c.skills?.toLowerCase().includes(s))
      )
    }
    if (location) {
      const loc = location.toLowerCase()
      candidates = candidates.filter(c => c.location?.toLowerCase().includes(loc))
    }
    if (experienceMin !== undefined && experienceMin > 0) {
      candidates = candidates.filter(c => (c.experienceYears || 0) >= experienceMin)
    }
    if (experienceMax !== undefined && experienceMax > 0) {
      candidates = candidates.filter(c => (c.experienceYears || 0) <= experienceMax)
    }

    return candidates
  },
}
