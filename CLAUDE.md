# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FeedbackApp is a Canny alternative for indie makers - a simple tool to collect user feedback, enable voting, share public roadmaps, and announce updates. Currently in early development with landing page live.

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
- `src/components/ui/` - shadcn/ui components (Button, Card, Input, Badge)
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging
- `src/lib/supabase.ts` - Supabase client (browser-side)

### Environment Variables
Copy `.env.local.example` to `.env.local` and add Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### UI Patterns
- Uses shadcn/ui with class-variance-authority for component variants
- Tailwind class merging via `cn()` utility from `@/lib/utils`
- Geist font family (Sans and Mono variants)

## Planned Features (see PLAN.md)
- Feedback board with upvoting
- Public roadmap (Kanban: Planned → In Progress → Done)
- Changelog for announcing shipped features
- Magic link authentication
