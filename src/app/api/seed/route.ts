import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Seed demo data
    const demoPassword = hashPassword('demo123')

    // Create demo users
    const jobSeeker = await db.user.upsert({
      where: { email: 'seeker@3boxes.com' },
      update: {},
      create: {
        email: 'seeker@3boxes.com',
        name: 'Rahul Sharma',
        password: demoPassword,
        role: 'JOB_SEEKER',
        phone: '+91-9876543210',
        location: 'Mumbai, India',
        bio: 'Passionate software developer with 5 years of experience in full-stack development.',
        jobSeekerProfile: {
          create: {
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
      },
    })

    const corporate = await db.user.upsert({
      where: { email: 'corp@3boxes.com' },
      update: {},
      create: {
        email: 'corp@3boxes.com',
        name: 'Priya Technologies',
        password: demoPassword,
        role: 'CORPORATE',
        phone: '+91-22-12345678',
        location: 'Bangalore, India',
        corporateProfile: {
          create: {
            companyName: 'Priya Technologies Pvt Ltd',
            industry: 'Information Technology',
            companySize: '201-500',
            website: 'https://priyatech.com',
            description: 'Leading IT solutions provider specializing in cloud computing, AI/ML solutions, and enterprise software development. We are building the future of digital transformation.',
            location: 'Bangalore, India',
            foundedYear: 2015,
            isVerified: true,
          },
        },
      },
    })

    const recruiter = await db.user.upsert({
      where: { email: 'recruiter@3boxes.com' },
      update: {},
      create: {
        email: 'recruiter@3boxes.com',
        name: 'Amit Patel',
        password: demoPassword,
        role: 'RECRUITER',
        phone: '+91-9988776655',
        location: 'Delhi, India',
        recruiterProfile: {
          create: {
            specialization: 'IT & Software',
            yearsExperience: 8,
            certifications: 'SHRM-CP, AIRS CIR',
            placementCount: 150,
            rating: 4.8,
          },
        },
      },
    })

    const admin = await db.user.upsert({
      where: { email: 'admin@3boxes.com' },
      update: {},
      create: {
        email: 'admin@3boxes.com',
        name: '3 Boxes Admin',
        password: demoPassword,
        role: 'ADMIN',
        phone: '+91-9000000000',
        location: 'Chennai, India',
      },
    })

    // Create demo jobs
    const corpProfile = await db.corporateProfile.findUnique({ where: { userId: corporate.id } })

    if (corpProfile) {
      const job1 = await db.job.create({
        data: {
          corporateId: corpProfile.id,
          title: 'Senior React Developer',
          description: 'We are looking for an experienced React developer to join our frontend team. You will be responsible for building and maintaining high-quality web applications using React, TypeScript, and modern tooling. Work closely with designers, backend engineers, and product managers to deliver exceptional user experiences.',
          requirements: '5+ years React experience, TypeScript, REST APIs, GraphQL, Testing (Jest/Cypress), CI/CD',
          responsibilities: 'Build reusable UI components, implement state management, optimize performance, mentor junior developers, participate in code reviews',
          salaryMin: 1200000,
          salaryMax: 2000000,
          jobType: 'full-time',
          experienceMin: 5,
          experienceMax: 8,
          location: 'Bangalore, India',
          isRemote: true,
          skills: 'React, TypeScript, GraphQL, Redux, Jest, Cypress, Node.js, AWS',
          benefits: 'Health insurance, Stock options, Flexible hours, Remote work, Learning budget',
          openings: 3,
          status: 'ACTIVE',
        },
      })

      const job2 = await db.job.create({
        data: {
          corporateId: corpProfile.id,
          title: 'Data Scientist - AI/ML',
          description: 'Join our AI team to develop cutting-edge machine learning models and data pipelines. You will work with large datasets, build predictive models, and deploy ML solutions at scale. Ideal candidate has strong statistical background and hands-on experience with deep learning frameworks.',
          requirements: 'Masters/PhD in CS/Statistics, Python, TensorFlow/PyTorch, SQL, Spark, ML model deployment',
          responsibilities: 'Design ML pipelines, develop predictive models, collaborate with engineering, present findings to stakeholders',
          salaryMin: 1500000,
          salaryMax: 2500000,
          jobType: 'full-time',
          experienceMin: 3,
          experienceMax: 6,
          location: 'Hyderabad, India',
          isRemote: false,
          skills: 'Python, TensorFlow, PyTorch, SQL, Spark, Statistics, Deep Learning, NLP',
          benefits: 'Health insurance, Conference budget, Stock options, Research time',
          openings: 2,
          status: 'ACTIVE',
        },
      })

      const job3 = await db.job.create({
        data: {
          corporateId: corpProfile.id,
          title: 'DevOps Engineer',
          description: 'We need a skilled DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. You will work with AWS/GCP services, containerization, and infrastructure as code. Help us achieve zero-downtime deployments and maintain 99.9% uptime SLA.',
          requirements: 'AWS/GCP, Docker, Kubernetes, Terraform, Jenkins/GitHub Actions, Linux, Networking',
          responsibilities: 'Manage cloud infrastructure, automate deployments, monitor system health, implement security best practices',
          salaryMin: 1000000,
          salaryMax: 1800000,
          jobType: 'full-time',
          experienceMin: 3,
          experienceMax: 7,
          location: 'Pune, India',
          isRemote: true,
          skills: 'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Python, Monitoring',
          benefits: 'Health insurance, Cloud certification budget, Flexible hours, Remote work',
          openings: 2,
          status: 'ACTIVE',
        },
      })

      const job4 = await db.job.create({
        data: {
          corporateId: corpProfile.id,
          title: 'Product Manager - SaaS',
          description: 'Lead the product strategy and roadmap for our B2B SaaS platform. Work with engineering, design, and sales teams to deliver features that drive customer value and business growth. Experience with agile methodologies and data-driven decision making is essential.',
          requirements: '5+ years PM experience in SaaS, Agile/Scrum, Analytics, Roadmap planning, User research',
          responsibilities: 'Define product roadmap, prioritize features, conduct user research, track KPIs, coordinate cross-functional teams',
          salaryMin: 1800000,
          salaryMax: 3000000,
          jobType: 'full-time',
          experienceMin: 5,
          experienceMax: 10,
          location: 'Mumbai, India',
          isRemote: false,
          skills: 'Product Strategy, Agile, Analytics, User Research, SaaS, Roadmapping, A/B Testing',
          benefits: 'Health insurance, Stock options, Travel budget, Learning budget',
          openings: 1,
          status: 'ACTIVE',
        },
      })

      const job5 = await db.job.create({
        data: {
          corporateId: corpProfile.id,
          title: 'UI/UX Designer',
          description: 'Create beautiful and intuitive user interfaces for our suite of products. You will lead the design process from research and wireframing to high-fidelity mockups and prototyping. Collaborate with product and engineering to deliver delightful user experiences.',
          requirements: '3+ years UI/UX experience, Figma/Sketch, Design systems, User research, Prototyping, HTML/CSS',
          responsibilities: 'Conduct user research, create wireframes and prototypes, maintain design system, present designs to stakeholders',
          salaryMin: 800000,
          salaryMax: 1500000,
          jobType: 'full-time',
          experienceMin: 3,
          experienceMax: 6,
          location: 'Chennai, India',
          isRemote: true,
          skills: 'Figma, Sketch, Design Systems, User Research, Prototyping, HTML/CSS, Adobe Creative Suite',
          benefits: 'Design tool subscriptions, Conference budget, Flexible hours, Creative time',
          openings: 2,
          status: 'ACTIVE',
        },
      })
    }

    // Create training courses
    const courses = [
      {
        title: 'React Advanced Patterns & Performance',
        description: 'Master advanced React patterns including hooks, context, render optimization, and state management with Redux Toolkit. Build production-ready applications with best practices.',
        category: 'Programming',
        level: 'advanced',
        duration: 24,
        skills: 'React, TypeScript, Redux Toolkit, Performance Optimization, Testing',
        instructor: 'Dr. Sarah Chen',
        rating: 4.9,
        enrollCount: 2500,
      },
      {
        title: 'Machine Learning with Python',
        description: 'Comprehensive course on machine learning fundamentals and advanced techniques. Covers supervised/unsupervised learning, deep learning, and model deployment using Python and TensorFlow.',
        category: 'Data Science',
        level: 'intermediate',
        duration: 40,
        skills: 'Python, TensorFlow, Scikit-learn, Pandas, NumPy, Deep Learning, NLP',
        instructor: 'Prof. Raj Kumar',
        rating: 4.8,
        enrollCount: 3200,
      },
      {
        title: 'AWS Cloud Practitioner to Solutions Architect',
        description: 'Complete AWS certification prep from Cloud Practitioner to Solutions Architect. Hands-on labs with real AWS services. Master EC2, S3, Lambda, RDS, and more.',
        category: 'Cloud Computing',
        level: 'intermediate',
        duration: 36,
        skills: 'AWS, EC2, S3, Lambda, CloudFormation, IAM, VPC, RDS',
        instructor: 'Kevin Johnson',
        rating: 4.7,
        enrollCount: 1800,
      },
      {
        title: 'System Design for Senior Engineers',
        description: 'Learn how to design scalable distributed systems. Covers load balancing, caching, database sharding, message queues, and microservices architecture. Essential for senior engineering interviews.',
        category: 'Programming',
        level: 'advanced',
        duration: 20,
        skills: 'System Design, Distributed Systems, Scalability, Load Balancing, Caching, Microservices',
        instructor: 'Alex Rivera',
        rating: 4.9,
        enrollCount: 2100,
      },
      {
        title: 'Full-Stack Node.js Development',
        description: 'Build complete web applications with Node.js, Express, and MongoDB. Learn REST API design, authentication, real-time features with Socket.io, and deployment strategies.',
        category: 'Programming',
        level: 'intermediate',
        duration: 30,
        skills: 'Node.js, Express, MongoDB, REST API, Socket.io, JWT, Deployment',
        instructor: 'Meera Iyer',
        rating: 4.6,
        enrollCount: 1500,
      },
      {
        title: 'Digital Marketing Masterclass',
        description: 'Comprehensive digital marketing course covering SEO, SEM, social media marketing, content marketing, email marketing, and analytics. Build and execute complete marketing strategies.',
        category: 'Marketing',
        level: 'beginner',
        duration: 18,
        skills: 'SEO, SEM, Social Media Marketing, Google Analytics, Content Marketing, Email Marketing',
        instructor: 'Lisa Wong',
        rating: 4.5,
        enrollCount: 1200,
      },
      {
        title: 'Docker & Kubernetes in Production',
        description: 'Master containerization and orchestration for production environments. Learn Docker best practices, Kubernetes deployment strategies, Helm charts, and monitoring with Prometheus.',
        category: 'Cloud Computing',
        level: 'intermediate',
        duration: 28,
        skills: 'Docker, Kubernetes, Helm, Prometheus, Grafana, CI/CD, Container Security',
        instructor: 'Tom Anderson',
        rating: 4.8,
        enrollCount: 1900,
      },
      {
        title: 'Product Management Fundamentals',
        description: 'Learn the essentials of product management - from market research and user interviews to roadmap planning and go-to-market strategy. Includes real-world case studies.',
        category: 'Product',
        level: 'beginner',
        duration: 15,
        skills: 'Product Strategy, User Research, Roadmapping, A/B Testing, Analytics, Agile',
        instructor: 'Jennifer Park',
        rating: 4.7,
        enrollCount: 980,
      },
    ]

    for (const course of courses) {
      await db.trainingCourse.upsert({
        where: { id: course.title.replace(/\s+/g, '-').toLowerCase() },
        update: {},
        create: { id: course.title.replace(/\s+/g, '-').toLowerCase(), ...course },
      })
    }

    // Create demo resume for job seeker
    await db.resume.create({
      data: {
        userId: jobSeeker.id,
        title: 'Rahul Sharma - Software Engineer',
        summary: 'Passionate full-stack developer with 5 years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies. Strong problem-solver with a track record of delivering high-impact projects on time.',
        experience: JSON.stringify([
          { company: 'TechCorp India', role: 'Senior Software Engineer', duration: '2022 - Present', description: 'Led frontend architecture for enterprise SaaS platform serving 100K+ users. Implemented micro-frontend architecture reducing deployment time by 60%. Mentored team of 4 junior developers.' },
          { company: 'StartupHub', role: 'Full-Stack Developer', duration: '2020 - 2022', description: 'Built real-time collaboration features using WebSocket and React. Designed and implemented RESTful APIs serving 50K+ daily requests. Improved application performance by 40% through optimization.' },
          { company: 'CodeSoft Solutions', role: 'Junior Developer', duration: '2018 - 2020', description: 'Developed responsive web applications using React and Node.js. Participated in agile sprints and code reviews. Implemented automated testing achieving 85% code coverage.' },
        ]),
        education: JSON.stringify([
          { institution: 'IIT Mumbai', degree: 'B.Tech in Computer Science', year: '2018', grade: '8.5 CGPA' },
        ]),
        skills: JSON.stringify([
          { name: 'React', level: 'Expert', source: 'Experience' },
          { name: 'TypeScript', level: 'Expert', source: 'Experience' },
          { name: 'Node.js', level: 'Advanced', source: 'Experience' },
          { name: 'Python', level: 'Advanced', source: 'Experience' },
          { name: 'AWS', level: 'Intermediate', source: 'Training' },
          { name: 'Docker', level: 'Intermediate', source: 'Training' },
          { name: 'MongoDB', level: 'Advanced', source: 'Experience' },
          { name: 'GraphQL', level: 'Intermediate', source: 'Training' },
        ]),
        certifications: JSON.stringify([
          { name: 'AWS Solutions Architect Associate', year: '2023', issuer: 'Amazon Web Services' },
          { name: 'Meta Frontend Developer Certificate', year: '2022', issuer: 'Meta' },
        ]),
        projects: JSON.stringify([
          { name: 'E-Commerce Platform', description: 'Built full-stack e-commerce platform with React, Node.js, and MongoDB. Features include real-time inventory, payment integration, and admin dashboard.', link: 'github.com/rahulsharma/ecommerce' },
          { name: 'AI Chat Application', description: 'Developed real-time chat app with AI-powered responses using OpenAI API and WebSocket. Supports 1000+ concurrent users.', link: 'github.com/rahulsharma/ai-chat' },
        ]),
        languages: JSON.stringify([
          { name: 'English', proficiency: 'Professional' },
          { name: 'Hindi', proficiency: 'Native' },
        ]),
        achievements: JSON.stringify([
          'Won HackIndia 2023 - Built AI-powered recruitment platform in 48 hours',
          'Published 2 technical articles on Medium with 10K+ views each',
          'Open source contributor - 500+ GitHub stars across projects',
        ]),
        template: 'professional',
        isDefault: true,
      },
    })

    // Create skill assessments
    const skills = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'MongoDB', 'GraphQL', 'CI/CD', 'Git']
    for (const skill of skills) {
      await db.skillAssessment.create({
        data: {
          userId: jobSeeker.id,
          skillName: skill,
          level: 50 + Math.random() * 40,
          source: Math.random() > 0.5 ? 'training' : 'self',
        },
      })
    }

    // Create some notifications
    const notifs = [
      { userId: jobSeeker.id, title: 'Welcome to 3 Boxes Jobs!', message: 'Complete your profile to increase your visibility to recruiters by up to 80%.', type: 'info' },
      { userId: jobSeeker.id, title: 'New Job Match Found', message: 'We found 5 new jobs matching your skills. Check them out in your dashboard!', type: 'success', link: '/dashboard/jobs' },
      { userId: jobSeeker.id, title: 'AI Skill Assessment Available', message: 'Take an AI-powered skill assessment to validate your React expertise and boost your profile score.', type: 'info' },
    ]
    for (const notif of notifs) {
      await db.notification.create({ data: notif })
    }

    return NextResponse.json({
      message: 'Seed data created successfully',
      users: {
        jobSeeker: { email: 'seeker@3boxes.com', password: 'demo123' },
        corporate: { email: 'corp@3boxes.com', password: 'demo123' },
        recruiter: { email: 'recruiter@3boxes.com', password: 'demo123' },
        admin: { email: 'admin@3boxes.com', password: 'demo123' },
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
