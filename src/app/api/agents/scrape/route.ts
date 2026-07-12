import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Helper: ensure DB is seeded before any agent operation
async function ensureSeeded() {
  try {
    const { ensureSeedData } = await import('@/lib/db')
    await ensureSeedData()
  } catch {}
}

// Helper: Extract company name from URL
function extractCompanyName(url: string): string {
  try {
    const hostname = new URL(url).hostname
    // Remove www. and TLD
    const name = hostname.replace(/^www\./, '').split('.')[0]
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return 'Unknown Company'
  }
}

// Helper: Generate realistic fake scraped data
function generateFakeScrapeData(url: string) {
  const baseName = extractCompanyName(url)

  const suffixes = ['Solutions', 'Technologies', 'Labs', 'Systems', 'Digital', 'Innovations', 'Group', 'Software']
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  const companyName = Math.random() > 0.4 ? `${baseName} ${suffix}` : baseName

  const industries = [
    'Information Technology', 'FinTech', 'HealthTech', 'EdTech',
    'E-Commerce', 'SaaS', 'AI/ML', 'Cybersecurity', 'Cloud Computing',
    'Data Analytics', 'IoT', 'CleanTech', 'AgriTech', 'Logistics',
  ]
  const sizes = ['11-50', '51-200', '201-500', '501-1000', '1000+']
  const locations = [
    'Bangalore, India', 'Mumbai, India', 'Hyderabad, India',
    'Pune, India', 'Chennai, India', 'Delhi, India',
    'San Francisco, USA', 'London, UK', 'Singapore',
  ]
  const departments = ['Engineering', 'Product', 'Design', 'Data Science', 'Marketing', 'Sales']
  const benefits = [
    'Health Insurance', 'Stock Options', 'Remote Work', 'Learning Budget',
    'Flexible Hours', 'Parental Leave', 'Gym Membership', 'Team Retreats',
  ]

  const numOpenings = Math.floor(Math.random() * 8) + 2
  const openings = []
  const jobTitles = [
    'Senior Software Engineer', 'Full-Stack Developer', 'Data Scientist',
    'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
    'Backend Engineer', 'ML Engineer', 'Cloud Architect',
    'QA Lead', 'Technical Writer', 'Engineering Manager',
  ]

  for (let i = 0; i < numOpenings; i++) {
    openings.push({
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      type: Math.random() > 0.3 ? 'Full-time' : Math.random() > 0.5 ? 'Remote' : 'Hybrid',
      experience: `${Math.floor(Math.random() * 6) + 2}-${Math.floor(Math.random() * 4) + 5} years`,
    })
  }

  const contactNames = [
    'Rajesh Kumar', 'Priya Sharma', 'Anita Desai', 'Vikram Patel',
    'Sunita Menon', 'Deepak Rao', 'Neha Gupta', 'Arjun Reddy',
    'Sarah Johnson', 'Michael Chen', 'Emily Watson', 'David Lee',
  ]

  const numContacts = Math.floor(Math.random() * 3) + 1
  const contacts = []
  const hrRoles = ['HR Manager', 'Talent Acquisition Lead', 'Recruiting Manager', 'People Operations', 'Head of HR']
  for (let i = 0; i < numContacts; i++) {
    const contactName = contactNames[Math.floor(Math.random() * contactNames.length)]
    const emailFirst = contactName.split(' ')[0].toLowerCase()
    const emailLast = contactName.split(' ')[1]?.toLowerCase() || ''
    contacts.push({
      name: contactName,
      role: hrRoles[Math.floor(Math.random() * hrRoles.length)],
      email: `${emailFirst}.${emailLast}@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      linkedIn: `https://linkedin.com/in/${emailFirst}${emailLast}`,
    })
  }

  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '')

  return {
    companyName,
    careersPageUrl: `https://${domain}.com/careers`,
    aboutPage: `https://${domain}.com/about`,
    industry: industries[Math.floor(Math.random() * industries.length)],
    companySize: sizes[Math.floor(Math.random() * sizes.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    foundedYear: Math.floor(Math.random() * 20) + 2005,
    description: `${companyName} is a leading ${industries[Math.floor(Math.random() * industries.length)].toLowerCase()} company focused on delivering innovative solutions. With a team of dedicated professionals, we're building the future of technology.`,
    techStack: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'].slice(0, Math.floor(Math.random() * 4) + 3),
    benefits: benefits.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 3),
    openings,
    contacts,
    contactEmail: `info@${domain}.com`,
    hrEmail: contacts[0]?.email || `hr@${domain}.com`,
    linkedInUrl: `https://linkedin.com/company/${domain}`,
    socialMedia: {
      twitter: `https://twitter.com/${domain}`,
      github: Math.random() > 0.5 ? `https://github.com/${domain}` : null,
    },
    scrapedAt: new Date().toISOString(),
  }
}

// POST /api/agents/scrape - Scrape a company website (simulated)
export async function POST(request: NextRequest) {
  try {
    await ensureSeeded()
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check if we already scraped this URL
    const existing = await prisma.aICompanyScrape.findFirst({
      where: { companyUrl: url },
      orderBy: { lastScrapedAt: 'desc' },
    })

    if (existing && existing.lastScrapedAt) {
      const hoursSinceLastScrape = (Date.now() - existing.lastScrapedAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastScrape < 24) {
        return NextResponse.json({
          message: 'Company already scraped recently (within 24 hours)',
          scrape: existing,
          cached: true,
        })
      }
    }

    // Generate fake scraped data
    const scrapedData = generateFakeScrapeData(url)

    // Create or update the company scrape record
    const scrape = await prisma.aICompanyScrape.upsert({
      where: { id: existing?.id || 'nonexistent' },
      create: {
        companyUrl: url,
        companyName: scrapedData.companyName,
        careersPageUrl: scrapedData.careersPageUrl,
        contactEmail: scrapedData.contactEmail,
        hrEmail: scrapedData.hrEmail,
        linkedInUrl: scrapedData.linkedInUrl,
        industry: scrapedData.industry,
        companySize: scrapedData.companySize,
        location: scrapedData.location,
        scrapeData: JSON.stringify(scrapedData),
        status: 'scraped',
        lastScrapedAt: new Date(),
      },
      update: {
        companyName: scrapedData.companyName,
        careersPageUrl: scrapedData.careersPageUrl,
        contactEmail: scrapedData.contactEmail,
        hrEmail: scrapedData.hrEmail,
        linkedInUrl: scrapedData.linkedInUrl,
        industry: scrapedData.industry,
        companySize: scrapedData.companySize,
        location: scrapedData.location,
        scrapeData: JSON.stringify(scrapedData),
        status: 'scraped',
        lastScrapedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Company scraped successfully (simulated)',
      scrape,
      data: scrapedData,
      cached: false,
    }, { status: 201 })
  } catch (error) {
    console.error('Company scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape company' }, { status: 500 })
  }
}
