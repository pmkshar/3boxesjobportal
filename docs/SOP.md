# 3 Boxes Jobs - Standard Operating Procedures (SOPs)

## 1. Deployment Procedures

### 1.1 Development Deployment (Local)

```bash
# 1. Clone the repository
git clone https://github.com/pmkshar/3boxesjobportal.git
cd 3boxesjobportal

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with local configuration

# 4. Push database schema
bun run db:push

# 5. Start development server
bun run dev

# 6. Seed demo data
curl -X POST http://localhost:3000/api/seed
```

### 1.2 Production Deployment (Vercel)

The production deployment is automated through the GitHub-Vercel integration:

1. **Push to main branch**: Any push to the `main` branch on GitHub automatically triggers a Vercel deployment
2. **Vercel Build Process**:
   - Install dependencies
   - Run `next build`
   - Deploy static assets to CDN
   - Deploy API routes as serverless functions
3. **Post-Deployment Verification**:
   - Visit the production URL
   - Verify landing page loads
   - Test login with demo credentials
   - Test core user flows (job search, AI interview, training)

### 1.3 Manual Vercel Deployment

If automatic deployment fails:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

### 1.4 Rollback Procedure

If a deployment introduces critical issues:

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Alternatively, revert the Git commit and push:
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 2. Database Management

### 2.1 Schema Changes

When modifying the database schema:

1. Edit `prisma/schema.prisma`
2. Push changes: `bun run db:push`
3. Generate client: `bun run db:generate`
4. Test locally before pushing to production
5. For production: Vercel will automatically run `db:push` on deploy (configure in build command)

**Important:** SQLite does not support all Prisma migration features. For production, switch to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Database Reset

To reset the entire database:

```bash
bun run db:reset
# Or manually:
rm db/custom.db
bun run db:push
curl -X POST http://localhost:3000/api/seed
```

### 2.3 Database Backup

For SQLite:
```bash
# Create backup
cp db/custom.db db/backup/custom-$(date +%Y%m%d-%H%M%S).db

# Restore backup
cp db/backup/custom-20240115-120000.db db/custom.db
```

For PostgreSQL (production):
```bash
pg_dump -h host -U user -d dbname > backup-$(date +%Y%m%d).sql
psql -h host -U user -d dbname < backup-20240115.sql
```

### 2.4 Data Seeding

The seed endpoint creates demo data:
- 4 demo users (Job Seeker, Corporate, Recruiter, Admin)
- 5 job postings
- 8 training courses
- 1 resume with full data
- 10 skill assessments
- 3 notifications

```bash
curl -X POST http://localhost:3000/api/seed
```

The seed uses `upsert` operations, so it's safe to run multiple times.

---

## 3. Monitoring and Observability

### 3.1 Application Monitoring

**Vercel Analytics:**
- Enable Vercel Analytics in project settings
- Monitor Web Vitals (LCP, FID, CLS, TTFB)
- Set up Speed Insights for performance tracking

**Custom Analytics:**
The platform tracks `AnalyticsEvent` records in the database:
- `page_view` — Page navigation events
- `job_applied` — Job application submissions
- `interview_completed` — AI interview completions
- `training_completed` — Training course completions
- `resume_updated` — Resume modifications
- `skill_updated` — Skill auto-update events

### 3.2 Error Monitoring

**Recommended: Sentry Integration**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure Sentry DSN in Vercel environment variables.

### 3.3 Uptime Monitoring

**Recommended: Uptime Robot or BetterUptime**
- Monitor production URL every 5 minutes
- Alert on downtime via email/Slack
- Track response time trends

### 3.4 Log Management

- Vercel provides built-in log streaming
- API route errors are logged via `console.error`
- Check Vercel Dashboard → Project → Functions → Logs

---

## 4. Incident Response

### 4.1 Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 - Critical | Platform completely down, data loss | Immediate |
| P1 - High | Major feature broken, many users affected | < 1 hour |
| P2 - Medium | Feature partially broken, workaround exists | < 4 hours |
| P3 - Low | Minor issue, cosmetic, few users affected | < 24 hours |

### 4.2 Incident Response Process

1. **Detection**: Alert from monitoring, user report, or self-discovery
2. **Assessment**: Determine severity level
3. **Communication**: Notify team via designated channel
4. **Mitigation**: Implement fix or rollback
5. **Resolution**: Deploy fix, verify recovery
6. **Post-Mortem**: Document incident, root cause, and prevention

### 4.3 Common Incident Scenarios

**Database Connection Issues:**
- Symptom: API routes return 500 errors
- Check: Vercel function logs for Prisma connection errors
- Fix: Verify DATABASE_URL environment variable, check database availability

**Vercel Deployment Failure:**
- Symptom: New push doesn't deploy
- Check: Vercel Dashboard → Deployments for error logs
- Fix: Fix build errors locally (`bun run lint`, `bun run build`), then push

**Application Crashes:**
- Symptom: Pages show error boundary or blank screen
- Check: Browser console for errors, Vercel function logs
- Fix: Identify the failing component, fix and push

---

## 5. User Management

### 5.1 Creating Admin Users

Currently, admin users can only be created via the seed endpoint or direct database operations:

```typescript
// Via API
const admin = await db.user.create({
  data: {
    email: 'newadmin@3boxes.com',
    name: 'New Admin',
    password: hashPassword('securepassword'),
    role: 'ADMIN',
  }
})
```

### 5.2 Deactivating Users

Set `isActive` to false:
```typescript
await db.user.update({
  where: { id: 'user-id' },
  data: { isActive: false }
})
```

### 5.3 Role Changes

Update the user's role field:
```typescript
await db.user.update({
  where: { id: 'user-id' },
  data: { role: 'CORPORATE' }
})
```

**Note:** Role changes also require creating the corresponding profile record.

---

## 6. Security Procedures

### 6.1 Environment Variables

All sensitive configuration must be stored in Vercel environment variables:
- `DATABASE_URL` — Database connection string
- Any API keys for AI services
- Secret keys for authentication

Never commit `.env` files to Git. The `.gitignore` includes `.env` entries.

### 6.2 Dependency Updates

Regularly update dependencies to patch security vulnerabilities:

```bash
# Check for vulnerabilities
bun audit

# Update dependencies
bun update

# Test after updates
bun run lint
bun run dev
```

### 6.3 Access Review

Monthly review:
1. Check all admin accounts are still valid
2. Review active user accounts for anomalies
3. Verify Vercel team member access
4. Check GitHub repository collaborators

---

## 7. Backup and Recovery

### 7.1 Backup Schedule

| Data | Frequency | Method |
|------|-----------|--------|
| SQLite Database | Daily (manual) | File copy |
| PostgreSQL (prod) | Every 6 hours | pg_dump + S3 |
| GitHub Repository | Continuous | Git push |
| Vercel Configuration | On change | Manual export |

### 7.2 Recovery Testing

Quarterly recovery drill:
1. Restore database from backup
2. Verify data integrity
3. Test application with restored data
4. Document recovery time

---

## 8. Release Process

### 8.1 Release Checklist

- [ ] All features tested locally
- [ ] Lint passes: `bun run lint`
- [ ] Database schema changes pushed: `bun run db:push`
- [ ] Environment variables updated in Vercel
- [ ] Documentation updated
- [ ] Git commit with descriptive message
- [ ] Push to GitHub `main` branch
- [ ] Verify Vercel deployment succeeds
- [ ] Smoke test production deployment
- [ ] Notify team of release

### 8.2 Version Numbering

Follow semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

Current version: 0.2.0 (as specified in package.json)

### 8.3 Hotfix Process

1. Create hotfix branch from main: `git checkout -b hotfix/description main`
2. Fix the issue
3. Test locally
4. Push and merge to main
5. Verify Vercel deployment
