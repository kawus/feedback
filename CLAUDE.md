# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FeedbackApp is a Canny alternative for indie makers - a simple tool to collect user feedback, enable voting, share public roadmaps, and announce updates. MVP complete and live at https://woerk.vercel.app

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 16 with App Router (React 19)
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Database:** Supabase (auth, database, realtime)
- **Language:** TypeScript (strict mode)

## Architecture

### Path Aliases
- `@/*` maps to `./src/*`

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/app/b/[slug]/` - Board pages (feedback, roadmap, changelog, settings)
- `src/app/api/` - API routes for posts and boards
- `src/components/ui/` - shadcn/ui components (Button, Card, Input, Badge)
- `src/components/boards/` - Board-specific components (forms, lists, badges)
- `src/components/auth/` - Authentication provider
- `src/lib/` - Utility functions (supabase, auth, board-tokens)

### Environment Variables
Copy `.env.local.example` to `.env.local` and add Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for API routes)

### UI Patterns
- Uses shadcn/ui with class-variance-authority for component variants
- Tailwind class merging via `cn()` utility from `@/lib/utils`
- Geist font family (Sans and Mono variants)

### Design System (Linear/Notion-inspired)
Premium design tokens defined in `globals.css`:

**Shadows (layered for depth):**
- `--shadow-sm`: Subtle single shadow
- `--shadow-md`: 3-layer shadow for cards/buttons
- `--shadow-lg`: 5-layer shadow for elevated elements
- `--shadow-hover`: Hover state shadow

**Usage:** `shadow-[var(--shadow-md)]`

**Spacing:** 8px grid (use Tailwind: p-2=8px, gap-4=16px, mb-6=24px, mt-8=32px)

**Typography:**
- Headlines: `font-semibold tracking-tight leading-tight`
- Body: `leading-relaxed`

**Border radius:** 6px base (`--radius: 0.375rem`)

**Transitions:** 200ms ease-out, hover lift with `-translate-y-0.5`

**Colors:** Use semantic tokens (`text-foreground`, `bg-muted`, `border-border`)

## Current Features
- **Feedback board** - Submit and vote on feature requests (email-based voting)
- **Status management** - Owners can set Open → Planned → In Progress → Done
- **Public roadmap** - Kanban view of planned/in-progress/done items
- **Changelog** - Timeline of shipped features and updates
- **Magic link auth** - Claim boards permanently via email
- **Board settings** - Delete posts and boards

## Architecture Notes
- **Login-last approach** - Users can create boards without auth, claim later
- **Claim token system** - localStorage stores ownership until claimed
- **Dual ownership check** - Validates via claim token OR authenticated user
- See PLAN.md for full architecture details and database schema
