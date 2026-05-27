import type { WorkMode } from "../types"

interface ParsedJob {
  company: string | null
  role: string | null
  location: string | null
  work_mode: WorkMode | null
  salary_min: number | null
  salary_max: number | null
  tech_stack: string[]
}

const KNOWN_TECH = [
  'React', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Nuxt', 'Remix',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Golang', 'Rust',
  'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'Elixir',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring',
  'Ruby on Rails', 'Rails', 'Laravel', '.NET',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
  'SQLite', 'Cassandra', 'Kafka', 'RabbitMQ',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'GraphQL', 'REST', 'gRPC', 'WebSocket',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Tailwind', 'CSS', 'SASS', 'HTML',
  'TensorFlow', 'PyTorch', 'OpenAI', 'LLM',
  'Figma', 'Storybook', 'Jest', 'Cypress', 'Playwright',
  'Prisma', 'Drizzle', 'Sequelize', 'Supabase', 'Firebase',
  'Vercel', 'Netlify', 'Heroku',
  'Linux', 'Nginx', 'Apache',
  'Agile', 'Scrum', 'Jira',
  'WebGL', 'Three.js', 'D3.js',
]

export function parseJobDescription(text: string): ParsedJob {
  const result: ParsedJob = {
    company: null,
    role: null,
    location: null,
    work_mode: null,
    salary_min: null,
    salary_max: null,
    tech_stack: [],
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Role detection - look for common job title patterns
  const rolePatterns = [
    /\b((?:senior|junior|lead|principal|staff|intern|mid[- ]?level|entry[- ]?level|sr\.?|jr\.?)\s+)?(?:software|frontend|backend|full[- ]?stack|devops|cloud|data|machine learning|ml|mobile|ios|android|web|platform|infrastructure|product|site reliability|sre|qa|quality|security|solutions?)\s+(?:engineer|developer|architect|manager|analyst|scientist|consultant|specialist|lead)/i,
    /\b((?:senior|junior|lead|principal|staff|intern|sr\.?|jr\.?)\s+)?(?:engineer|developer|architect)\s*[-,]?\s*(?:software|frontend|backend|full[- ]?stack|devops|cloud|data|web|platform|mobile)/i,
    /\b((?:senior|junior|lead|principal|staff|sr\.?|jr\.?)\s+)?(?:software|frontend|backend|full[- ]?stack|web)\s+(?:engineer|developer)/i,
  ]

  for (const line of lines) {
    for (const pattern of rolePatterns) {
      const match = line.match(pattern)
      if (match) {
        result.role = match[0].trim()
        break
      }
    }
    if (result.role) break
  }

  // If no role found from patterns, use the first short line as role
  if (!result.role) {
    const firstShortLine = lines.find((l) => l.length > 5 && l.length < 80 && !l.includes('http'))
    if (firstShortLine) result.role = firstShortLine
  }

  // Company detection - "at Company", "Company is hiring", "About Company"
  const companyPatterns = [
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s*[-,|]|\s+is\b|\s+we\b|$)/,
    /^about\s+([A-Z][A-Za-z0-9\s&.'-]+?)$/im,
    /([A-Z][A-Za-z0-9&.'-]+?)\s+is\s+(?:hiring|looking|seeking)/i,
    /company:\s*(.+)/i,
    /organization:\s*(.+)/i,
  ]

  for (const pattern of companyPatterns) {
    const match = text.match(pattern)
    if (match) {
      result.company = match[1].trim()
      break
    }
  }

  // Location detection
  const locationPatterns = [
    /(?:location|based in|office in|located in|headquarters in)[:\s]+([A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/i,
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:ON|BC|AB|QC|MB|SK|NS|NB|PE|NL|NT|YT|NU|CA|NY|SF|WA|TX|IL|MA|GA|CO|OR|PA|VA|NC|FL|OH|MI|MN|AZ|MD|CT|NJ))\b/,
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:Canada|USA|United States|UK|United Kingdom|Australia|Germany|France|Ireland|Netherlands|Singapore|Japan))\b/i,
    /\b(San Francisco|New York|Los Angeles|Seattle|Austin|Chicago|Boston|Denver|Toronto|Vancouver|Montreal|Calgary|Ottawa|London|Berlin|Amsterdam|Dublin|Sydney|Singapore)\b/i,
  ]

  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      result.location = match[1] ? match[1].trim() : match[0].trim()
      break
    }
  }

  // Work mode detection
  const textLower = text.toLowerCase()
  if (/\bfully?\s*remote\b|\bremote\s*(?:first|only|position|role|work)\b|\b100%\s*remote\b/.test(textLower)) {
    result.work_mode = 'remote'
  } else if (/\bhybrid\b/.test(textLower)) {
    result.work_mode = 'hybrid'
  } else if (/\bon[- ]?site\b|\bin[- ]?office\b|\bin[- ]?person\b/.test(textLower)) {
    result.work_mode = 'onsite'
  }

  // Salary detection
  const salaryPatterns = [
    /\$\s*([\d,]+)\s*[k]?\s*[-–to]+\s*\$?\s*([\d,]+)\s*[k]?/i,
    /(?:salary|compensation|pay|range)[:\s]*\$?\s*([\d,]+)\s*[k]?\s*[-–to]+\s*\$?\s*([\d,]+)\s*[k]?/i,
    /([\d,]+)\s*[k]\s*[-–to]+\s*([\d,]+)\s*[k]/i,
    /CAD\s*([\d,]+)\s*[-–to]+\s*([\d,]+)/i,
    /USD\s*([\d,]+)\s*[-–to]+\s*([\d,]+)/i,
  ]

  for (const pattern of salaryPatterns) {
    const match = text.match(pattern)
    if (match) {
      let min = parseInt(match[1].replace(/,/g, ''))
      let max = parseInt(match[2].replace(/,/g, ''))
      // If values look like "150k-200k" format (small numbers with k)
      if (min < 1000) min *= 1000
      if (max < 1000) max *= 1000
      if (min > 0 && max > 0 && max >= min) {
        result.salary_min = min
        result.salary_max = max
      }
      break
    }
  }

  // Tech stack detection
  const found = new Set<string>()
  for (const tech of KNOWN_TECH) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(text)) {
      found.add(tech)
    }
  }
  // Normalize duplicates
  if (found.has('Golang') && found.has('Go')) found.delete('Golang')
  if (found.has('Rails') && found.has('Ruby on Rails')) found.delete('Rails')
  result.tech_stack = Array.from(found).slice(0, 15)

  return result
}
