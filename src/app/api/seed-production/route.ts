import { NextResponse } from 'next/server'

/**
 * Production Seed Endpoint
 *
 * Seeds the Neon PostgreSQL production database with initial data.
 * - If no admin exists: creates all role users + jobs + courses
 * - If admin exists but some roles are missing: adds the missing role users
 * - If all roles exist: skips entirely
 *
 * Usage: POST https://3boxesjobs.com/api/seed-production
 */
export async function POST() {
  const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')
  if (!isProduction) {
    return NextResponse.json(
      { error: 'This endpoint is only for production (Neon PostgreSQL) environments.' },
      { status: 403 }
    )
  }

  try {
    const { db } = await import('@/lib/db')
    const { hashPassword } = await import('@/lib/auth')
    const demoPassword = hashPassword('demo123')

    // ─── Ensure all role users exist ──────────────────────────────
    const requiredUsers = [
      { email: 'admin@3boxesjobs.com', name: '3 Boxes Admin', role: 'ADMIN', phone: '+91-9000000000', location: 'India', bio: 'Platform administrator.' },
      { email: 'seeker@3boxesjobs.com', name: 'Rahul Sharma', role: 'JOB_SEEKER', phone: '+91-9876543210', location: 'Mumbai, India', bio: 'Experienced developer seeking new opportunities.' },
      { email: 'hr@3boxesjobs.com', name: '3 Boxes Technologies', role: 'CORPORATE', phone: '+91-8000000000', location: 'India', bio: 'AI-powered recruitment platform.' },
      { email: 'recruiter@3boxesjobs.com', name: 'Amit Patel', role: 'RECRUITER', phone: '+91-9988776655', location: 'Delhi, India', bio: 'Senior IT recruiter.' },
      { email: 'hrmanager@3boxesjobs.com', name: 'Sneha Reddy', role: 'HR_MANAGER', phone: '+91-9222222222', location: 'Hyderabad, India', bio: 'HR manager managing recruitment pipeline.' },
      { email: 'interviewer@3boxesjobs.com', name: 'Vikram Singh', role: 'INTERVIEWER', phone: '+91-9333333333', location: 'Delhi, India', bio: 'Technical interviewer specializing in coding interviews.' },
    ]

    const createdUsers: { email: string; role: string; isNew: boolean }[] = []
    let seekerUser: any = null
    let corporateUser: any = null

    for (const reqUser of requiredUsers) {
      const existing = await db.user.findUnique({ where: { email: reqUser.email } })
      if (!existing) {
        const createData: any = {
          email: reqUser.email,
          name: reqUser.name,
          password: demoPassword,
          role: reqUser.role as any,
          phone: reqUser.phone,
          location: reqUser.location,
          bio: reqUser.bio,
        }

        // Add role-specific profiles
        if (reqUser.role === 'JOB_SEEKER') {
          createData.jobSeekerProfile = {
            create: {
              headline: 'Senior Full-Stack Developer',
              experienceYears: 5,
              currentRole: 'Full-Stack Developer',
              currentCompany: 'Tech Solutions India',
              education: 'B.Tech Computer Science',
              expectedSalary: '15-25 LPA',
              jobType: 'full-time',
              availability: 'immediate',
              skills: 'React, Node.js, TypeScript, AWS, Docker, PostgreSQL',
              aiSkillScore: 78,
              profileComplete: 85,
            },
          }
        } else if (reqUser.role === 'CORPORATE') {
          createData.corporateProfile = {
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
          }
        } else if (reqUser.role === 'RECRUITER') {
          createData.recruiterProfile = {
            create: {
              specialization: 'IT',
              yearsExperience: 8,
              certifications: 'SHRM-CP, PHR',
              placementCount: 150,
              rating: 4.5,
            },
          }
        }

        const newUser = await db.user.create({ data: createData })
        createdUsers.push({ email: reqUser.email, role: reqUser.role, isNew: true })

        if (reqUser.role === 'JOB_SEEKER') seekerUser = newUser
        if (reqUser.role === 'CORPORATE') corporateUser = newUser
      } else {
        createdUsers.push({ email: reqUser.email, role: reqUser.role, isNew: false })
        if (reqUser.role === 'JOB_SEEKER') seekerUser = existing
        if (reqUser.role === 'CORPORATE') corporateUser = existing
      }
    }

    // ─── Ensure corporate profile and jobs exist ───────────────────
    const corpProfile = await db.corporateProfile.findFirst({
      where: corporateUser ? { userId: corporateUser.id } : { companyName: '3 Boxes Technologies' },
    })

    if (corpProfile) {
      const existingJobs = await db.job.count({ where: { corporateId: corpProfile.id } })
      if (existingJobs === 0) {
        const jobsData = [
          {
            title: 'Senior Full-Stack Developer',
            description: 'Join our team to build cutting-edge AI-powered recruitment tools.',
            requirements: '5+ years experience in full-stack development. React, Node.js, TypeScript.',
            responsibilities: 'Design and implement new features. Mentor junior developers.',
            salaryMin: 1500000, salaryMax: 2500000, jobType: 'full-time',
            experienceMin: 5, experienceMax: 10, location: 'Bangalore, India', isRemote: false,
            skills: 'React, Node.js, TypeScript, AWS, Docker, PostgreSQL',
            benefits: 'Health insurance, flexible hours, learning budget', openings: 3,
            status: 'ACTIVE', corporateId: corpProfile.id,
          },
          {
            title: 'AI/ML Engineer',
            description: 'Build intelligent matching algorithms and NLP-powered systems.',
            requirements: '3+ years experience in ML/AI. Python, TensorFlow/PyTorch.',
            responsibilities: 'Develop AI matching algorithms. Build resume parsing pipelines.',
            salaryMin: 1800000, salaryMax: 3000000, jobType: 'full-time',
            experienceMin: 3, experienceMax: 8, location: 'Hyderabad, India', isRemote: true,
            skills: 'Python, TensorFlow, NLP, Machine Learning, Data Science',
            benefits: 'Health insurance, remote work, conference budget', openings: 2,
            status: 'ACTIVE', corporateId: corpProfile.id,
          },
          {
            title: 'Mobile App Developer (Flutter)',
            description: 'Build and maintain our cross-platform mobile app.',
            requirements: '2+ years Flutter/Dart experience. REST APIs, state management.',
            responsibilities: 'Develop new mobile features. Optimize app performance.',
            salaryMin: 1200000, salaryMax: 2000000, jobType: 'full-time',
            experienceMin: 2, experienceMax: 5, location: 'Mumbai, India', isRemote: true,
            skills: 'Flutter, Dart, REST APIs, Firebase, Mobile Development',
            benefits: 'Health insurance, flexible hours, device budget', openings: 2,
            status: 'ACTIVE', corporateId: corpProfile.id,
          },
          {
            title: 'DevOps Engineer',
            description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure high availability.',
            requirements: '3+ years DevOps experience. AWS/GCP, Docker, Kubernetes, Terraform.',
            responsibilities: 'Manage cloud infrastructure. Design CI/CD pipelines.',
            salaryMin: 1400000, salaryMax: 2200000, jobType: 'full-time',
            experienceMin: 3, experienceMax: 7, location: 'Pune, India', isRemote: true,
            skills: 'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux',
            benefits: 'Health insurance, remote work, learning budget', openings: 1,
            status: 'ACTIVE', corporateId: corpProfile.id,
          },
        ]

        for (const job of jobsData) {
          await db.job.create({ data: job })
        }
      }
    }

    // ─── Ensure training courses exist ──────────────────────────────
    const existingCourses = await db.trainingCourse.count()
    if (existingCourses === 0) {
      const coursesData = [
        {
          title: 'Full-Stack Web Development Bootcamp',
          description: 'Comprehensive course covering React, Node.js, databases, and deployment.',
          category: 'Programming', level: 'intermediate', duration: 40,
          skills: 'React, Node.js, MongoDB, Deployment, REST APIs',
          instructor: '3 Boxes Training Team', rating: 4.7, enrollCount: 0, isActive: true,
        },
        {
          title: 'AI & Machine Learning Fundamentals',
          description: 'Learn the foundations of AI and ML, including neural networks and NLP.',
          category: 'Data Science', level: 'beginner', duration: 30,
          skills: 'Python, TensorFlow, Neural Networks, NLP, Data Analysis',
          instructor: '3 Boxes Training Team', rating: 4.5, enrollCount: 0, isActive: true,
        },
      ]

      for (const course of coursesData) {
        await db.trainingCourse.create({ data: course })
      }
    }

    const totalUsers = await db.user.count()
    const totalJobs = await db.job.count()
    const totalCourses = await db.trainingCourse.count()
    const newUsersCount = createdUsers.filter(u => u.isNew).length

    return NextResponse.json({
      message: newUsersCount > 0
        ? `Added ${newUsersCount} missing role users to production database.`
        : 'Production database already fully seeded. No changes needed.',
      users: createdUsers,
      credentials: {
        admin: { email: 'admin@3boxesjobs.com', password: 'demo123' },
        seeker: { email: 'seeker@3boxesjobs.com', password: 'demo123' },
        corporate: { email: 'hr@3boxesjobs.com', password: 'demo123' },
        recruiter: { email: 'recruiter@3boxesjobs.com', password: 'demo123' },
        hr_manager: { email: 'hrmanager@3boxesjobs.com', password: 'demo123' },
        interviewer: { email: 'interviewer@3boxesjobs.com', password: 'demo123' },
      },
      stats: { users: totalUsers, jobs: totalJobs, courses: totalCourses },
    })
  } catch (error) {
    console.error('Production seed error:', error)
    return NextResponse.json(
      { error: 'Production seed failed.', details: String(error) },
      { status: 500 }
    )
  }
}
