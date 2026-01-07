# FeedbackApp - Project Plan

## Vision
Be the "Tally of feedback tools" - a dead-simple alternative to Canny for indie makers and small teams.

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
| Admin actions | Status changes, delete, settings |

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
- [x] Connect Supabase for email collection
- [x] Deploy to Vercel
- [ ] Post on Indie Hackers for validation
- [ ] Find 10 interested people

### Week 2: Anonymous Board Flow (No Auth!)
- [ ] Database schema (boards with claim_token, posts, votes)
- [ ] Create board form → generates slug + claim_token
- [ ] Store claim_token in localStorage
- [ ] Board page at /b/[slug]
- [ ] "Save this board" banner (CTA for later)

### Week 3: Feedback + Voting (No Auth!)
- [ ] Submit feedback form (email + title + description)
- [ ] Feedback list view with vote counts
- [ ] Email-based upvoting (one vote per email)
- [ ] Sort by votes/recent
- [ ] "Powered by FeedbackApp" badge

### Week 4: Claim Flow + Admin (Auth Introduced)
- [ ] Magic link "claim board" flow
- [ ] Link board to user account (set user_id, clear expires_at)
- [ ] Admin actions: change status, delete feedback
- [ ] Board settings page

### Week 5: Roadmap + Polish
- [ ] Roadmap kanban view (Planned → In Progress → Done)
- [ ] Public roadmap page
- [ ] Loading states
- [ ] Mobile responsiveness
- [ ] Launch on Indie Hackers, Twitter

---

## Database Schema (Draft)

```sql
-- Users (handled by Supabase Auth)

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

### Why This Works
1. Low marginal cost per user (just database rows)
2. Self-onboarding (no support overhead)
3. Virality built-in (every board = free ad)
4. Free users spread word of mouth → paid conversions

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

---

## 🎯 Next Steps (Updated: Dec 30, 2024)

### Immediate Priority: Get Live & Validate

**Step 1: Connect Email Collection** ✅ DONE
- ~~Create `waitlist` table in Supabase~~
- ~~Wire up landing page form to save emails~~
- ~~Add success toast/message~~

**Step 2: Deploy to Vercel** ✅ DONE
- ~~Connect GitHub repo to Vercel~~
- ~~Add Supabase env variables~~
- ~~Your landing page goes live!~~

**Step 3: Start Validation** 🟢 LOW RISK ← YOU ARE HERE
- Post on Indie Hackers (show landing page, ask for feedback)
- Share in relevant Twitter/X communities
- Goal: 10 email signups + 5 user conversations

### After Validation: Build Core MVP (Login-Last!)

**Step 4: Database Schema** 🟡 MEDIUM RISK
- Set up tables: boards (with claim_token, expires_at), posts, votes
- Configure RLS for public read, token-based write

**Step 5: Anonymous Board Creation** 🟢 LOW RISK
- Create board form → generates slug + claim_token
- Store claim_token in localStorage
- Board page at /b/[slug]

**Step 6: Feedback + Voting** 🟢 LOW RISK
- Public feedback submission (email only)
- Email-based voting
- "Powered by" badge

**Step 7: Claim Flow (Auth)** 🟡 MEDIUM RISK
- Magic link to claim board
- Admin actions require auth

---

### 📊 Current Progress

| Phase | Status |
|-------|--------|
| Project setup | ✅ Done |
| Landing page | ✅ Done |
| Email collection | ✅ Done |
| Deploy to Vercel | ✅ Done |
| Validation | ⏳ Next |
| Database schema | 🔜 Pending |
| Anonymous board creation | 🔜 Pending |
| Feedback + voting | 🔜 Pending |
| Claim flow (auth) | 🔜 Pending |
| Roadmap view | 🔜 Pending |
