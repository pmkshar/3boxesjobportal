import { NextResponse } from 'next/server'

/**
 * Production Seed Endpoint
 *
 * This endpoint seeds the Neon PostgreSQL production database with initial data.
 * It should be called ONCE after setting up a new Neon database for production.
 *
 * Usage: POST https://3boxesjobs.com/api/seed-production
 *
 * IMPORTANT: After seeding, you should disable or remove this endpoint
 * to prevent accidental re-seeding in production.
 */
export async function POST() {
  // Only allow seeding in production (Neon PostgreSQL) environment
  const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')
  if (!isProduction) {
    return NextResponse.json(
      { error: 'This endpoint is only for production (Neon PostgreSQL) environments. Use /api/seed for demo.' },
      { status: 403 }
    )
  }

  try {
    const { db } = await import('@/lib/db')
    const { hashPassword } = await import('@/lib/auth')

    // Check if data already exists
    const userCount = await db.user.count()
    if (userCount > 0) {
      return NextResponse.json(
        { message: 'Production database already has data. Skipping seed.', userCount },
        { status: 200 }
      )
    }

    const demoPassword = hashPassword('demo123')

    // ─── Create Production Admin User ────────────────────────────
    const admin = await db.user.create({
      data: {
        email: 'admin@3boxesjobs.com',
        name: '3 Boxes Admin',
        password: demoPassword,
        role: 'ADMIN',
        phone: '+91-9000000000',
        location: 'India',
        bio: 'Platform administrator for 3 Boxes Jobs production environment.',
      },
    })

    // ─── Create Default Corporate (3 Boxes) ──────────────────────
    const corporate = await db.user.create({
      data: {
        email: 'hr@3boxesjobs.com',
        name: '3 Boxes Jobs',
        password: demoPassword,
        role: 'CORPORATE',
        phone: '+91-8000000000',
        location: 'India',
        corporateProfile: {
          create: {
            companyName: '3 Boxes Technologies',
            industry: 'Information Technology & Recruitment',
            companySize: '51-200',
            website: 'https://3boxesjobs.com',
            description: 'India\'s first AI-powered job portal with smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching.',
            location: 'India',
            foundedYear: 2024,
            isVerified: true,
          },
        },
      },
    })

    // ─── Create Sample Job Listings ──────────────────────────────
    const corpProfile = await db.corporateProfile.findFirst({ where: { userId: corporate.id } })
    if (!corpProfile) {
      return NextResponse.json({ error: 'Corporate profile not created' }, { status: 500 })
    }

    const jobsData = [
      {
        title: 'Senior Full-Stack Developer',
        description: 'Join our team to build cutting-edge AI-powered recruitment tools. Work with React, Node.js, and cloud technologies.',
        requirements: '5+ years experience in full-stack development. Proficiency in React, Node.js, TypeScript. Experience with cloud platforms (AWS/GCP).',
        responsibilities: 'Design and implement new features. Collaborate with product and design teams. Mentor junior developers.',
        salaryMin: 1500000,
        salaryMax: 2500000,
        jobType: 'full-time',
        experienceMin: 5,
        experienceMax: 10,
        location: 'Bangalore, India',
        isRemote: false,
        skills: 'React, Node.js, TypeScript, AWS, Docker, PostgreSQL',
        benefits: 'Health insurance, flexible hours, learning budget, stock options',
        openings: 3,
        status: 'ACTIVE',
        corporateId: corpProfile.id,
      },
      {
        title: 'AI/ML Engineer',
        description: 'Build intelligent matching algorithms and NLP-powered resume parsing systems for our job portal.',
        requirements: '3+ years experience in ML/AI. Proficiency in Python, TensorFlow/PyTorch. Experience with NLP and recommendation systems.',
        responsibilities: 'Develop AI matching algorithms. Build resume parsing pipelines. Optimize model performance.',
        salaryMin: 1800000,
        salaryMax: 3000000,
        jobType: 'full-time',
        experienceMin: 3,
        experienceMax: 8,
        location: 'Hyderabad, India',
        isRemote: true,
        skills: 'Python, TensorFlow, NLP, Machine Learning, Data Science',
        benefits: 'Health insurance, remote work, conference budget, stock options',
        openings: 2,
        status: 'ACTIVE',
        corporateId: corpProfile.id,
      },
      {
        title: 'Mobile App Developer (Flutter)',
        description: 'Build and maintain our cross-platform mobile app for job seekers and recruiters.',
        requirements: '2+ years Flutter/Dart experience. Experience with REST APIs, state management, and native integrations.',
        responsibilities: 'Develop new mobile features. Optimize app performance. Implement UI/UX designs.',
        salaryMin: 1200000,
        salaryMax: 2000000,
        jobType: 'full-time',
        experienceMin: 2,
        experienceMax: 5,
        location: 'Mumbai, India',
        isRemote: true,
        skills: 'Flutter, Dart, REST APIs, Firebase, Mobile Development',
        benefits: 'Health insurance, flexible hours, device budget',
        openings: 2,
        status: 'ACTIVE',
        corporateId: corpProfile.id,
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure high availability of our job portal platform.',
        requirements: '3+ years DevOps experience. Expert in AWS/GCP, Docker, Kubernetes, Terraform. CI/CD pipeline design.',
        responsibilities: 'Manage cloud infrastructure. Design CI/CD pipelines. Monitor system performance.',
        salaryMin: 1400000,
        salaryMax: 2200000,
        jobType: 'full-time',
        experienceMin: 3,
        experienceMax: 7,
        location: 'Pune, India',
        isRemote: true,
        skills: 'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux',
        benefits: 'Health insurance, remote work, learning budget',
        openings: 1,
        status: 'ACTIVE',
        corporateId: corpProfile.id,
      },
    ]

    for (const job of jobsData) {
      await db.job.create({ data: job })
    }

    // ─── Create Sample Training Courses ──────────────────────────
    const coursesData = [
      {
        title: 'Full-Stack Web Development Bootcamp',
        description: 'Comprehensive course covering React, Node.js, databases, and deployment. Build real-world projects.',
        category: 'Programming',
        level: 'intermediate',
        duration: 40,
        skills: 'React, Node.js, MongoDB, Deployment, REST APIs',
        instructor: '3 Boxes Training Team',
        rating: 4.7,
        enrollCount: 0,
        isActive: true,
      },
      {
        title: 'AI & Machine Learning Fundamentals',
        description: 'Learn the foundations of AI and ML, including neural networks, NLP, and practical applications.',
        category: 'Data Science',
        level: 'beginner',
        duration: 30,
        skills: 'Python, TensorFlow, Neural Networks, NLP, Data Analysis',
        instructor: '3 Boxes Training Team',
        rating: 4.5,
        enrollCount: 0,
        isActive: true,
      },
    ]

    for (const course of coursesData) {
      await db.trainingCourse.create({ data: course })
    }

    // ─── Create Notification ─────────────────────────────────────
    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'Production Database Seeded',
        message: 'The production database has been seeded with initial data. You can now start adding real users and job listings.',
        type: 'success',
      },
    })

    return NextResponse.json({
      message: 'Production database seeded successfully!',
      users: {
        admin: { email: 'admin@3boxesjobs.com', password: 'demo123' },
        corporate: { email: 'hr@3boxesjobs.com', password: 'demo123' },
      },
      stats: {
        users: await db.user.count(),
        jobs: await db.job.count(),
        courses: await db.trainingCourse.count(),
      },
      note: 'IMPORTANT: Change default passwords immediately after first login. Disable this endpoint after seeding.',
    })
  } catch (error) {
    console.error('Production seed error:', error)
    return NextResponse.json(
      { error: 'Production seed failed. Check Neon PostgreSQL database configuration.', details: String(error) },
      { status: 500 }
    )
  }
}
