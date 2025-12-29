# FeedbackApp - Project Plan

## Vision
Be the "Tally of feedback tools" - a dead-simple alternative to Canny for indie makers and small teams.

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

## MVP Scope (4 weeks)

### Core Features (v1)
- [ ] **Feedback board** - Users submit feature requests
- [ ] **Upvoting** - Users vote on requests
- [ ] **Public roadmap** - Kanban: Planned → In Progress → Done
- [ ] **Changelog** - Announce shipped features

### Explicitly NOT in v1
- User authentication complexity (use magic links)
- Integrations (Slack, Jira, etc.)
- Analytics/segmentation
- Custom domains
- Multiple boards per account

### Success Criteria
- Can set up a board in < 2 minutes
- Looks beautiful without customization
- Works on mobile
- At least 5 real users actively using it

---

## Tech Stack

- **Frontend:** Next.js 14 App Router + shadcn/ui + Tailwind
- **Database:** Supabase (auth, database, realtime)
- **Hosting:** Vercel
- **Payments:** Stripe (when needed)

---

## Build Plan

### Week 1: Foundation + Validation
- [x] Project setup (Next.js + Supabase + shadcn)
- [x] Landing page with email capture
- [ ] Connect Supabase for email collection
- [ ] Deploy to Vercel
- [ ] Post on Indie Hackers for validation
- [ ] Find 10 interested people

### Week 2: Core Database + Auth
- [ ] Database schema (users, boards, posts, votes)
- [ ] Magic link authentication
- [ ] Create board flow
- [ ] Board settings page

### Week 3: Feedback + Voting
- [ ] Submit feedback form (public)
- [ ] Feedback list view
- [ ] Upvoting mechanism
- [ ] Sort by votes/recent

### Week 4: Roadmap + Changelog
- [ ] Roadmap kanban view
- [ ] Drag-and-drop status changes
- [ ] Changelog entries
- [ ] Public changelog page
- [ ] "Powered by" badge

### Week 5: Polish + Launch
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Onboard early users
- [ ] Launch on Indie Hackers, Twitter

---

## Database Schema (Draft)

```sql
-- Users (handled by Supabase Auth)

-- Boards
boards (
  id uuid primary key,
  user_id uuid references auth.users,
  name text,
  slug text unique,
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

-- Votes
votes (
  id uuid primary key,
  post_id uuid references posts,
  voter_email text,
  created_at timestamp,
  unique(post_id, voter_email)
)

-- Changelog
changelog_entries (
  id uuid primary key,
  board_id uuid references boards,
  title text,
  content text,
  published_at timestamp
)
```

---

## Monetization (Future)

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 board, 100 posts, "Powered by" badge |
| Pro | $9/mo | Unlimited, no badge, custom domain |
| Team | $29/mo | Multiple boards, team members |

---

## Growth Strategy

1. **Viral loop:** "Powered by [Product]" badge on every free board
2. **Build in public:** Share progress on Twitter/Indie Hackers
3. **SEO:** Public roadmaps and changelogs are indexable
4. **Community:** Be active where indie makers hang out

---

## Validation Checklist

- [ ] 10+ email signups on landing page
- [ ] 5+ conversations with potential users
- [ ] Understand their current workarounds
- [ ] Confirm willingness to pay

---

## Key Principles

1. **Simplicity is the strategy** - Solve one problem beautifully
2. **Ship fast, learn fast** - A shipped MVP beats a perfect plan
3. **Talk to users obsessively** - PM skills are the superpower here
4. **Don't fall in love** - Fall in love with the process, not the idea
