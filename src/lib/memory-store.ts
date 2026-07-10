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

  _initialized = true
}

// Initialize on first import
seedMemoryData()

// ─── Memory Store API ──────────────────────────────────────────

export const memoryStore = {
  // Check if Prisma DB is available
  async isDbAvailable(): Promise<boolean> {
    if (_dbAvailable) return true
    try {
      const { db } = await import('./db')
      await db.user.count()
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
}
