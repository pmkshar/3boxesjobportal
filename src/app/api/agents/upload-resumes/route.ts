import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// Increase body size limit for ZIP file uploads
export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } },
}

// ─── DOCX Text Extractor (JSZip-based, Vercel-compatible) ──────────
// DOCX files are ZIP archives containing XML. We extract text from
// word/document.xml using JSZip (already proven to work on Vercel)
// instead of mammoth which fails on Vercel's serverless runtime.

async function extractDocxText(fileBuffer: ArrayBuffer | Buffer): Promise<string> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(fileBuffer)

  // Primary: word/document.xml
  const docXmlFile = zip.file('word/document.xml')
  if (!docXmlFile) {
    throw new Error('Invalid DOCX: word/document.xml not found')
  }

  const xmlContent = await docXmlFile.async('string')

  // Extract text from <w:t> elements in the XML
  // Each <w:p> is a paragraph, each <w:r> is a run, each <w:t> has text
  const paragraphs: string[] = []

  // Split by paragraph tags to preserve line breaks
  const paraRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g
  const paraMatches = xmlContent.match(paraRegex) || []

  for (const para of paraMatches) {
    // Extract all <w:t> text content within this paragraph
    const textRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g
    let textMatch: RegExpExecArray | null
    const textParts: string[] = []

    while ((textMatch = textRegex.exec(para)) !== null) {
      // Decode XML entities
      const text = textMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#\d+;/g, ' ')
      textParts.push(text)
    }

    if (textParts.length > 0) {
      paragraphs.push(textParts.join(''))
    }
  }

  return paragraphs.join('\n')
}

// ─── Resume Text Parser ────────────────────────────────────────────
// Extracts structured candidate data from plain text (from DOCX/PDF/TXT)

function parseResumeText(text: string, fileName: string): Record<string, any> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const candidate: Record<string, any> = {
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    company: '',
    skills: '',
    education: '',
    experienceYears: 0,
    summary: '',
    linkedIn: '',
    source: fileName,
  }

  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const emailMatch = text.match(emailRegex)
  if (emailMatch) candidate.email = emailMatch[0]

  // Extract phone
  const phoneRegex = /(?:\+91[-.\s]?)?(?:\d{5}[-.\s]?\d{5}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}|\d{3}[-.\s]\d{2}[-.\s]\d{2}[-.\s]\d{2}[-.\s]\d{2})/
  const phoneMatch = text.match(phoneRegex)
  if (phoneMatch) candidate.phone = phoneMatch[0].trim()

  // Extract LinkedIn
  const linkedInRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/
  const linkedInMatch = text.match(linkedInRegex)
  if (linkedInMatch) candidate.linkedIn = `https://${linkedInMatch[0]}`

  // Extract name - usually first non-empty line that's not an email/phone
  for (const line of lines.slice(0, 10)) {
    if (!line.match(emailRegex) && !line.match(phoneRegex) && !line.match(/^[A-Z\s]{3,}$/) && line.length > 2 && line.length < 60 && !line.match(/^(resume|curriculum|cv|profile|contact|email|phone|mobile)/i)) {
      candidate.name = line.replace(/[|•·,]/g, '').trim()
      break
    }
  }
  if (!candidate.name) {
    // Fallback: use filename as name hint
    const nameFromFn = fileName.replace(/\.(docx?|pdf|txt)$/i, '').replace(/[_-]/g, ' ')
    candidate.name = nameFromFn.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  }

  // Extract title/role
  const titlePatterns = [
    /(?:title|role|position|designation)\s*[:\-]\s*(.+)/i,
    /^(senior|junior|lead|principal|staff|associate|assistant)?\s*(software|full[- ]?stack|backend|frontend|devops|data|machine learning|ai|product|project|program|ux|ui|qa|test|cloud|security|system|network|database|business|marketing|sales|hr|finance|operations|consultant|architect|engineer|developer|analyst|manager|director|designer|scientist|specialist|coordinator|executive|administrator|consultant)/im,
  ]
  for (const pattern of titlePatterns) {
    const match = text.match(pattern)
    if (match) {
      candidate.title = (match[1] || match[0]).trim().substring(0, 100)
      break
    }
  }

  // Extract location
  const locationPatterns = [
    /(?:location|city|address|based in)\s*[:\-]\s*(.+)/i,
    /\b(Bangalore|Bengaluru|Mumbai|Delhi|NCR|Hyderabad|Pune|Chennai|Kolkata|Noida|Gurgaon|Gurugram|Ahmedabad|Jaipur|Indore|Coimbatore|Kochi|Chandigarh|Lucknow|Bhopal)(?:\s*,\s*(India|Karnataka|Maharashtra|Tamil Nadu|Telangana|Uttar Pradesh|West Bengal|Gujarat|Rajasthan|Madhya Pradesh|Kerala))?/i,
  ]
  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      candidate.location = match[0].replace(/^(location|city|address|based in)\s*[:\-]\s*/i, '').trim()
      break
    }
  }

  // Extract skills
  const skillsSection = text.match(/(?:technical\s+)?skills\s*[:\-]([\s\S]*?)(?:\n\n|\n[A-Z])/i)
  if (skillsSection) {
    candidate.skills = skillsSection[1]
      .replace(/\n/g, ', ')
      .replace(/[|·•]/g, ',')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 40)
      .join(', ')
      .substring(0, 500)
  } else {
    // Try to extract common tech skills from the whole text
    const techKeywords = ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST', 'CI/CD', 'Git', 'Machine Learning', 'Data Science', 'AI', 'NLP', 'C++', 'C#', '.NET', 'Spring', 'Hibernate', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'HTML', 'CSS', 'SASS', 'Tailwind', 'Figma', 'Photoshop', 'Agile', 'Scrum', 'JIRA']
    const found = techKeywords.filter(k => new RegExp(`\\b${k.replace('.', '\\.')}\\b`, 'i').test(text))
    if (found.length > 0) candidate.skills = found.join(', ')
  }

  // Extract education
  const eduSection = text.match(/education\s*[:\-]([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+\s)/i)
  if (eduSection) {
    candidate.education = eduSection[1].replace(/\n/g, ' ').trim().substring(0, 200)
  } else {
    const degreeMatch = text.match(/\b(B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?Sc|M\.?Sc|B\.?Com|M\.?Com|B\.?A|M\.?A|MBA|BBA|BCA|MCA|PhD|B\.?Pharm|MBBS|LLB|LLM|CA|CS|ICWA)\b[^.\n]{0,80}/i)
    if (degreeMatch) candidate.education = degreeMatch[0].trim()
  }

  // Extract experience years
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i)
  if (expMatch) candidate.experienceYears = parseInt(expMatch[1])

  // Extract current company
  const companyPatterns = [
    /(?:current|present|company|employer|organization)\s*[:\-]\s*(.+)/i,
    /(?:working\s+(?:at|with|for))\s+([A-Z][a-zA-Z0-9\s&.]+)/,
  ]
  for (const pattern of companyPatterns) {
    const match = text.match(pattern)
    if (match) {
      candidate.company = match[1].trim().substring(0, 100)
      break
    }
  }

  // Summary from first few lines after name
  if (lines.length > 2) {
    const summaryLines = lines.slice(1, 5).filter(l =>
      l.length > 30 && l.length < 300 &&
      !l.match(emailRegex) && !l.match(phoneRegex)
    )
    if (summaryLines.length > 0) candidate.summary = summaryLines.join(' ').substring(0, 300)
  }

  return candidate
}

// ─── Extract text from a single file inside a ZIP or standalone ────

async function extractTextFromFile(
  fileBuffer: ArrayBuffer,
  fileName: string
): Promise<string> {
  const lowerName = fileName.toLowerCase()

  if (lowerName.endsWith('.docx')) {
    // DOCX = ZIP archive with XML → use JSZip extraction (Vercel-safe)
    return await extractDocxText(fileBuffer)
  } else if (lowerName.endsWith('.txt')) {
    return new TextDecoder().decode(fileBuffer)
  } else if (lowerName.endsWith('.doc')) {
    // .doc (legacy binary format) — best-effort text extraction
    const text = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer)
    // Filter to readable ASCII + common CJK ranges
    return text.replace(/[^\x20-\x7E\u4e00-\u9fff\u0900-\u097F\n\r]/g, ' ').replace(/\s+/g, ' ')
  } else if (lowerName.endsWith('.pdf')) {
    // PDF basic text extraction (no external deps)
    const text = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer)
    return text.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ')
  }

  return ''
}

// ─── POST Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const agentId = formData.get('agentId') as string | null
    const manualData = formData.get('candidates') as string | null

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    const candidates: Record<string, any>[] = []

    // Handle manual JSON data entry
    if (manualData) {
      try {
        const parsed = JSON.parse(manualData)
        if (Array.isArray(parsed)) {
          candidates.push(...parsed)
        } else {
          candidates.push(parsed)
        }
      } catch {
        return NextResponse.json({ error: 'Invalid candidates JSON data' }, { status: 400 })
      }
    }

    // Handle file upload
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const lowerName = file.name.toLowerCase()

      if (lowerName.endsWith('.zip')) {
        // ─── ZIP file: extract and parse each resume inside ───
        try {
          const JSZip = (await import('jszip')).default
          const zip = await JSZip.loadAsync(buffer)

          const fileEntries = Object.entries(zip.files).filter(
            ([name, f]) => !f.dir && /\.(docx?|txt|pdf)$/i.test(name) && !name.startsWith('__MACOSX')
          )

          for (const [entryName, zipEntry] of fileEntries) {
            try {
              const fileBuffer = await zipEntry.async('arraybuffer')
              const fileName = entryName.split('/').pop() || entryName
              const text = await extractTextFromFile(fileBuffer, fileName)

              if (text && text.trim().length > 10) {
                const parsed = parseResumeText(text, fileName)
                if (parsed.email || parsed.name) {
                  candidates.push(parsed)
                }
              }
            } catch (err) {
              console.error(`Error parsing ${entryName}:`, err)
              // Add with filename as fallback so we don't lose the entry
              const fallbackName = entryName.split('/').pop()?.replace(/\.\w+$/, '').replace(/[_-]/g, ' ') || 'Unknown'
              candidates.push({
                name: fallbackName,
                email: '',
                phone: '',
                source: entryName,
                status: 'parse_error',
                parseError: String(err),
              })
            }
          }
        } catch (zipErr) {
          console.error('ZIP processing error:', zipErr)
          return NextResponse.json({
            error: 'Failed to process ZIP file. Please ensure it is a valid ZIP archive.',
            details: String(zipErr),
          }, { status: 400 })
        }
      } else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
        // ─── Single DOCX / DOC file ───
        try {
          const text = await extractTextFromFile(buffer, file.name)
          if (text.trim().length > 10) {
            const parsed = parseResumeText(text, file.name)
            if (parsed.email || parsed.name) {
              candidates.push(parsed)
            }
          } else {
            return NextResponse.json({
              error: 'The uploaded DOCX file appears to be empty or could not be read. Please ensure the file contains readable text.',
            }, { status: 400 })
          }
        } catch (docxErr) {
          console.error('DOCX parse error:', docxErr)
          return NextResponse.json({
            error: 'Failed to parse DOCX file. The file may be corrupted or in an unsupported format.',
            details: String(docxErr),
            hint: 'Try saving the resume as a .txt file and uploading again, or copy-paste the content into the manual entry form.',
          }, { status: 400 })
        }
      } else if (lowerName.endsWith('.txt')) {
        // ─── Single TXT file ───
        const text = buffer.toString('utf-8')
        if (text.trim().length > 10) {
          const parsed = parseResumeText(text, file.name)
          candidates.push(parsed)
        }
      } else if (lowerName.endsWith('.csv')) {
        // ─── CSV file with candidate data ───
        const text = buffer.toString('utf-8')
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
            const candidate: Record<string, any> = { source: file.name }
            headers.forEach((h, idx) => {
              const val = values[idx] || ''
              if (h.includes('name')) candidate.name = val
              else if (h.includes('email') || h.includes('mail')) candidate.email = val
              else if (h.includes('phone') || h.includes('mobile') || h.includes('contact')) candidate.phone = val
              else if (h.includes('location') || h.includes('city')) candidate.location = val
              else if (h.includes('title') || h.includes('role') || h.includes('position') || h.includes('designation')) candidate.title = val
              else if (h.includes('company') || h.includes('employer') || h.includes('organization')) candidate.company = val
              else if (h.includes('skill')) candidate.skills = val
              else if (h.includes('education') || h.includes('degree') || h.includes('qualification')) candidate.education = val
              else if (h.includes('experience') || h.includes('exp') || h.includes('years')) candidate.experienceYears = parseInt(val) || 0
              else if (h.includes('linkedin')) candidate.linkedIn = val
              else if (h.includes('summary') || h.includes('profile') || h.includes('about')) candidate.summary = val
            })
            if (candidate.email || candidate.name) candidates.push(candidate)
          }
        }
      } else if (lowerName.endsWith('.pdf')) {
        // ─── Single PDF file (basic text extraction) ───
        try {
          const text = await extractTextFromFile(buffer, file.name)
          if (text.trim().length > 10) {
            const parsed = parseResumeText(text, file.name)
            if (parsed.email || parsed.name) {
              candidates.push(parsed)
            }
          }
        } catch (pdfErr) {
          console.error('PDF parse error:', pdfErr)
          return NextResponse.json({
            error: 'Failed to extract text from PDF. Please try uploading a DOCX or TXT version instead.',
            details: String(pdfErr),
          }, { status: 400 })
        }
      } else {
        return NextResponse.json({
          error: `Unsupported file format: ${file.name}. Supported formats: .zip, .docx, .doc, .txt, .csv, .pdf`,
        }, { status: 400 })
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json({
        error: 'No candidates could be extracted from the uploaded file. Please ensure resumes contain email addresses or names.',
      }, { status: 400 })
    }

    // Process candidates through the data entry agent
    const result = await memoryStore.processResumeUpload(agentId, candidates)

    return NextResponse.json({
      message: `Processed ${result.totalProcessed} candidates: ${result.created} created, ${result.duplicates} duplicates, ${result.errors} errors`,
      ...result,
    }, { status: 201 })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({
      error: 'Failed to process resume upload',
      details: String(error),
    }, { status: 500 })
  }
}
