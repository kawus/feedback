# FeedbackApp - Project Plan

## Vision
Be the "Tally of feedback tools" - a dead-simple alternative to Canny for indie makers and small teams.

**Live at:** https://woerk.vercel.app

---

## Architecture Philosophy (Login-Last)

Inspired by Tally's approach: experience the magic first, auth only when needed.

> Tally grew to 400K users and $150K MRR with a genuinely free product. Free users ARE the marketing.

### No Login Required
| Action | How It Works |
|--------|--------------|
| Create a board | Generated slug + claim_token stored in localStorage |
| Submit feedback | Email only (for vote tracking) |
| Upvote | Email-based (one vote per email) |
| View roadmap | Fully public |
| View changelog | Fully public |

### Login Required
| Action | Why |
|--------|-----|
| Claim a board | Permanently link to account |
| Access from new device | Prove ownership |

### Unclaimed Boards
- Expire after 30 days (soft nudge to claim)
- Warning email at 7 days before expiry

---

## The Opportunity

**Problem:** Canny recently limited their free plan (100 posts, removed roadmaps). Pricing scales to $1,349/mo. Indie makers are actively seeking alternatives.

**Target users:** Indie hackers, solo founders, small SaaS teams (1-10 people)

**Differentiation:**
1. Set up in under 2 minutes
2. Beautiful by default
3. Generous free tier with viral "Powered by" badge
4. All-in-one: feedback → voting → roadmap → changelog
5. Built for indie makers, by an indie maker

---

## MVP Scope

### Core Features (v1)
- [x] **Feedback board** - Users submit feature requests
- [x] **Upvoting** - Users vote on requests (email-based)
- [x] **Status management** - Owner can set Planned/In Progress/Done
- [x] **Public roadmap** - Kanban: Planned → In Progress → Done
- [x] **Changelog** - Announce shipped features

### Explicitly NOT in v1
- User authentication complexity (use magic links)
- Integrations (Slack, Jira, etc.)
- Analytics/segmentation
- Custom domains
- Multiple boards per account

### Success Criteria
- Can set up a board in < 2 minutes ✅
- Looks beautiful without customization ✅
- Works on mobile ✅
- At least 5 real users actively using it ⏳

---

## Tech Stack

- **Frontend:** Next.js 16 App Router + shadcn/ui + Tailwind CSS 4
- **Database:** Supabase (auth, database, realtime)
- **Hosting:** Vercel
- **Payments:** Stripe (when needed)

---

## 📊 Current Progress (Updated: Jan 13, 2025)

| Phase | Status |
|-------|--------|
| Project setup | ✅ Done |
| Landing page | ✅ Done |
| Email collection (waitlist) | ✅ Done |
| Deploy to Vercel | ✅ Done |
| Database schema (boards, posts, votes) | ✅ Done |
| Anonymous board creation | ✅ Done |
| Feedback submission | ✅ Done |
| Voting system | ✅ Done |
| Status management (owner only) | ✅ Done |
| Roadmap view | ✅ Done |
| Changelog | ✅ Done |
| Claim flow (magic link auth) | ✅ Done |
| Powered by badge | ✅ Done |
| Board settings/delete | ✅ Done |

---

## What's Built

### Database Tables (Supabase)
- `waitlist` - Email collection for landing page
- `boards` - Feedback boards with claim_token for ownership
- `posts` - Feature requests with status field
- `votes` - Email-based voting (one vote per email per post)
- `changelog_entries` - Product update announcements

### Pages
- `/` - Landing page with waitlist signup
- `/create` - Create a new board (no login required)
- `/b/[slug]` - Board view with feedback list
- `/b/[slug]/roadmap` - Kanban roadmap view
- `/b/[slug]/changelog` - Timeline of product updates
- `/b/[slug]/settings` - Board settings (owner only)
- `/auth/callback` - Magic link auth handler
- `/design` - Design system documentation

### Key Features
- **Login-last architecture** - Create and manage boards without auth
- **Claim token system** - localStorage proves ownership
- **Magic link auth** - Claim boards permanently via email
- **Email-based voting** - No accounts needed
- **Status management** - Owner can change Open → Planned → In Progress → Done
- **Changelog** - Announce shipped features with timeline view
- **Delete posts/boards** - Owner can delete feedback and entire boards
- **Powered by badge** - Viral marketing badge on all public pages
- **Server-side validation** - API routes validate claim_token or user auth

### Files Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Board creation
│   ├── auth/callback/page.tsx # Magic link handler
│   ├── b/[slug]/
│   │   ├── page.tsx          # Board view
│   │   ├── roadmap/page.tsx  # Roadmap kanban
│   │   ├── changelog/page.tsx # Changelog timeline
│   │   ├── settings/page.tsx # Board settings
│   │   └── not-found.tsx     # 404 page
│   └── api/
│       ├── posts/[id]/route.ts    # Status update + delete
│       └── boards/
│           ├── [id]/route.ts      # Board delete
│           └── claim/route.ts     # Claim board
├── components/
│   ├── auth/
│   │   └── auth-provider.tsx      # Auth context
│   └── boards/
│       ├── create-board-form.tsx
│       ├── submit-feedback-form.tsx
│       ├── create-changelog-form.tsx
│       ├── feedback-list.tsx
│       ├── vote-button.tsx
│       ├── status-selector.tsx
│       ├── claim-banner.tsx
│       └── powered-by-badge.tsx
├── lib/
│   ├── supabase.ts           # Browser client
│   ├── auth.ts               # Magic link helpers
│   ├── board-tokens.ts       # Claim token management
│   └── voter-email.ts        # Voter email storage
└── types/
    └── database.ts           # TypeScript types
```

---

## 🎯 Next Steps

### Priority 1: Validation (NOW!)
- [ ] Post on Indie Hackers (share the live product)
- [ ] Share in Twitter/X communities
- [ ] Goal: 10 real users + 5 conversations

### Future Enhancements (After Validation)
- [ ] Email notifications (new feedback, status changes)
- [ ] Edit board name
- [ ] Edit/delete changelog entries
- [ ] Link changelog entries to completed feedback posts
- [ ] Board expiry warning emails (7 days before)
- [ ] Multi-board support per user

---

## Database Schema

```sql
-- Boards (login-last: user_id is NULL until claimed)
boards (
  id uuid primary key,
  user_id uuid references auth.users,  -- NULL until claimed
  name text,
  slug text unique,
  claim_token text,                     -- Secret for anonymous admin access
  expires_at timestamp,                 -- NULL if claimed, 30 days if unclaimed
  created_at timestamp
)

-- Posts (feedback items)
posts (
  id uuid primary key,
  board_id uuid references boards,
  title text,
  description text,
  status text, -- 'open', 'planned', 'in_progress', 'done'
  vote_count int default 0,
  author_email text,
  created_at timestamp
)

-- Votes (with auto-update trigger for vote_count)
votes (
  id uuid primary key,
  post_id uuid references posts,
  voter_email text,
  created_at timestamp,
  unique(post_id, voter_email)
)

-- Changelog entries
changelog_entries (
  id uuid primary key,
  board_id uuid references boards on delete cascade,
  title text not null,
  content text,
  published_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
)
```

---

## Monetization (Tally-Inspired)

### Philosophy
- Free tier is **genuinely unlimited** (not a crippled trial)
- The product IS the marketing ("Powered by" badge)
- No volume-based pricing (don't punish success)
- Upgrade for power features, not basic functionality

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | **Unlimited** boards, posts, votes, roadmap, changelog + "Powered by" badge |
| Pro | $19/mo | Remove badge, custom domain, team collaboration, Slack integration |

---

## Key Principles

1. **Simplicity is the strategy** - Solve one problem beautifully
2. **Ship fast, learn fast** - A shipped MVP beats a perfect plan
3. **Talk to users obsessively** - PM skills are the superpower here
4. **Don't fall in love** - Fall in love with the process, not the idea
