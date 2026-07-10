# 3 Boxes Jobs - Contributing Guide

Thank you for your interest in contributing to 3 Boxes Jobs! This guide outlines the process and standards for contributing to the project.

## Code of Conduct

- Be respectful and constructive in all interactions
- Focus on what is best for the community and the project
- Gracefully accept constructive criticism
- Report unacceptable behavior to the project maintainers

## How to Contribute

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/3boxesjobportal.git
cd 3boxesjobportal

# Add upstream remote
git remote add upstream https://github.com/pmkshar/3boxesjobportal.git
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

Branch naming conventions:
- `feature/` — New features (e.g., `feature/ai-resume-enhancement`)
- `fix/` — Bug fixes (e.g., `fix/login-validation`)
- `docs/` — Documentation updates (e.g., `docs/api-reference-update`)
- `refactor/` — Code refactoring (e.g., `refactor/auth-module`)
- `test/` — Test additions (e.g., `test/interview-flow`)

### 3. Development Setup

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Push database schema
bun run db:push

# Start development server
bun run dev
```

### 4. Make Your Changes

- Write clean, readable, well-documented code
- Follow the existing code style and patterns
- Add comments for complex logic
- Keep changes focused and minimal

### 5. Test Your Changes

```bash
# Run linting
bun run lint

# Manual testing
# - Test the feature in the browser
# - Test all user roles (Job Seeker, Corporate, Recruiter)
# - Test mobile responsiveness
# - Test with demo accounts
```

### 6. Commit Your Changes

Use conventional commit messages:

```
feat: add AI resume enhancement with z-ai-web-dev-sdk
fix: resolve login redirect issue for recruiter role
docs: update API reference for training endpoint
refactor: simplify skill auto-update logic
test: add integration tests for interview flow
```

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to any related issues
- Screenshots for UI changes
- Testing notes

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types (avoid `any` where possible)
- Use ES6+ import/export syntax
- Prefer `interface` over `type` for object shapes

### React Components

- Use `'use client'` directive for client components
- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use shadcn/ui components over custom implementations

### State Management

- **Auth State**: Use `useAuthStore` (Zustand)
- **Component State**: Use `useState` for local state
- **Server State**: Use `fetch` + `useEffect` or TanStack Query
- **Form State**: Use controlled components with `useState`

### Styling

- Use Tailwind CSS utility classes
- Follow the color system:
  - Primary: Emerald (emerald-600/700)
  - Corporate: Teal (teal-600/700)
  - Recruiter: Cyan (cyan-600/700)
- Use shadcn/ui component styling
- Ensure responsive design (mobile-first)
- Avoid inline styles

### API Routes

- Follow RESTful conventions
- Use proper HTTP status codes
- Include error handling with try-catch
- Return structured error responses
- Validate input data

### Database

- Use Prisma ORM for all database operations
- Import the singleton: `import { db } from '@/lib/db'`
- Use `include` and `select` to optimize queries
- Never write raw SQL unless absolutely necessary

## Project Architecture

### File Organization

- `src/app/api/` — API route handlers
- `src/components/portal/` — Business components
- `src/components/ui/` — shadcn/ui base components (do not modify)
- `src/lib/` — Shared utilities and libraries
- `src/hooks/` — Custom React hooks
- `prisma/` — Database schema and migrations
- `docs/` — Project documentation

### Component Patterns

**Dashboard Pattern:**
```typescript
export function SomeDashboard() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardHome />
      case 'feature': return <FeatureView />
      // ...
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <aside>{/* Sidebar */}</aside>
        <main>{renderContent()}</main>
      </div>
    </div>
  )
}
```

**API Route Pattern:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const data = await db.model.findMany({ ... })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Pull Request Review Process

1. **Automated Checks**: Lint must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing by reviewer
4. **Documentation**: Major features require documentation updates
5. **Merge**: Squash and merge to main

## Reporting Issues

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, device, role
6. **Screenshots**: If applicable

## Feature Requests

When requesting features, include:

1. **Problem**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives Considered**: Other approaches you've thought of
4. **User Impact**: Which roles benefit?
5. **Priority**: How important is this?

## Questions?

For questions about contributing, open a GitHub issue with the `question` label.
