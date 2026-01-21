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
- `src/app/my-boards/` - Dashboard showing all user's boards
- `src/app/signin/` - Sign-in page with magic link auth
- `src/app/api/` - API routes:
  - `auth/send-otp/` - Send OTP verification code to email
  - `auth/verify-otp/` - Verify OTP code and record verification
  - `boards/[id]/` - Board PATCH (rename) and DELETE
  - `changelog/[id]/` - Changelog entry PATCH and DELETE
  - `posts/[id]/` - Post status PATCH and DELETE (dual auth: token OR user)
  - `comments/` - Comment POST (requires verified email) and DELETE (owner or author)
- `src/components/ui/` - shadcn/ui components (Button, Card, Input, Badge)
- `src/components/boards/` - Board-specific components (forms, lists, badges)
- `src/components/layout/` - Shared layout components (SiteHeader)
- `src/components/auth/` - Authentication provider + email verification form
- `src/lib/` - Utility functions (supabase, auth, board-tokens, verified-email)

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

**Animations (defined in globals.css):**
- `animate-shimmer`: Loading state shimmer (Linear/Stripe style)
- `animate-vote-bump`: Vote button scale animation
- `animate-vote-count`: Vote count bounce
- `animate-vote-arrow`: Arrow bounce on vote

## Current Features
- **Feedback board** - Submit and vote on feature requests, sort by votes/newest, filter by status
- **Email verification (OTP)** - Voting and commenting require verified email (6-digit code sent to email, valid for 30 days)
- **Comments** - Users can comment on feedback posts (verified email required, realtime updates)
- **Status management** - Owners can set Open → Planned → In Progress → Done
- **Public roadmap** - Kanban view of planned/in-progress/done items
- **Changelog** - Timeline of shipped features and updates (owners can edit/delete entries)
- **Magic link auth** - Claim boards permanently via email
- **My Boards dashboard** - View all boards (unclaimed in localStorage + claimed via account) with inline claiming
- **Board settings** - Edit board name, delete posts and boards

## UX Polish
- **Collapsible forms** - Feedback and changelog forms start collapsed, expand on click (progressive disclosure)
- **Board created modal** - Celebration modal with copy-able link and "what's next" guide
- **Vote animations** - Bounce + scale on vote, first-time voters see thank you toast
- **Status toasts** - Contextual feedback when owner changes status ("Shipped!" for done)
- **Claim banner** - Amber warning styling with fear-of-loss messaging
- **Empty states** - Icons and contextual copy for feedback, roadmap, changelog, my-boards
- **Shimmer loading** - Linear/Stripe-style loading animation
- **Navigation active state** - Current tab highlighted with background pill
- **Hover polish** - Cards lift on hover, admin actions appear on hover (progressive disclosure)
- **Adaptive header link** - Shows "My Boards" if user has boards, "Sign In" otherwise (always visible)

## Architecture Notes
- **Login-last approach** - Users can create boards without auth, claim later
- **Email verification for interactions** - Voting and commenting require OTP-verified email (prevents impersonation)
- **Claim token system** - localStorage stores board ownership until claimed
- **Dual ownership check** - Validates via claim token OR authenticated user
- See PLAN.md for full architecture details and database schema

## Auth Model Summary
| Action | Auth Required |
|--------|--------------|
| Create board | None (localStorage token) |
| Vote | Email verification (OTP) |
| Comment | Email verification (OTP) |
| Claim board | Magic link sign-in |
| Manage board settings | Claim token OR signed in |

## Database Triggers (Required for Voting)
The voting system requires these PostgreSQL triggers to keep `posts.vote_count` in sync:

```sql
-- Functions must use SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET vote_count = vote_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_vote_count()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_increment_trigger
AFTER INSERT ON votes FOR EACH ROW EXECUTE FUNCTION increment_vote_count();

CREATE TRIGGER vote_decrement_trigger
AFTER DELETE ON votes FOR EACH ROW EXECUTE FUNCTION decrement_vote_count();
```

## Comments Table (Required for Comments Feature)
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);

-- RLS: Anyone can read, anyone with email can insert
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly readable"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  WITH CHECK (author_email IS NOT NULL AND author_email != '');
```

## Verified Emails Table (Required for Email Verification)
```sql
CREATE TABLE verified_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verified_emails_email ON verified_emails(email);

ALTER TABLE verified_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check verification status"
  ON verified_emails FOR SELECT USING (true);

CREATE POLICY "Service role can manage verifications"
  ON verified_emails FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```
