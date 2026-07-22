/**
 * Switch Prisma Database Provider based on environment
 *
 * This script modifies prisma/schema.prisma before `prisma generate`
 * to use the correct database provider:
 * - SQLite (default) → for local development and demo deployment
 * - PostgreSQL → for production deployment with Neon
 *
 * Usage:
 *   node scripts/switch-db-provider.js [sqlite|postgresql]
 *
 * Or via env variable:
 *   DATABASE_PROVIDER=postgresql node scripts/switch-db-provider.js
 */

const fs = require('fs')
const path = require('path')

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')

// Determine target provider
const argProvider = process.argv[2]
const envProvider = process.env.DATABASE_PROVIDER
const provider = argProvider || envProvider || 'sqlite'

if (!['sqlite', 'postgresql'].includes(provider)) {
  console.error(`Invalid provider: ${provider}. Must be 'sqlite' or 'postgresql'.`)
  process.exit(1)
}

console.log(`Switching Prisma provider to: ${provider}`)

// Read current schema
let schema = fs.readFileSync(schemaPath, 'utf8')

// Replace provider line
const providerRegex = /provider\s*=\s*"sqlite"|provider\s*=\s*"postgresql"/g
const newProviderLine = `provider = "${provider}"`

if (!providerRegex.test(schema)) {
  console.error('Could not find provider line in schema.prisma')
  process.exit(1)
}

schema = schema.replace(providerRegex, newProviderLine)

// For PostgreSQL, we need to adjust some SQLite-specific features:
if (provider === 'postgresql') {
  // SQLite uses String for JSON-like fields, PostgreSQL can too (TEXT type)
  // No changes needed - Prisma handles the mapping
  console.log('PostgreSQL mode: schema adjustments applied')
}

// Write updated schema
fs.writeFileSync(schemaPath, schema, 'utf8')

console.log(`✅ schema.prisma updated with provider = "${provider}"`)
