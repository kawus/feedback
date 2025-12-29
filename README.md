# FeedbackApp

User feedback made stupidly simple. A Canny alternative for indie makers.

## What is this?

A simple tool to collect user feedback, let users vote on features, share your public roadmap, and announce updates. All in one place.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase
- **Hosting:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx        # Landing page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/
│   └── ui/             # shadcn components
└── lib/
    ├── utils.ts        # Utilities
    └── supabase.ts     # Supabase client
```

## Roadmap

See [PLAN.md](./PLAN.md) for the full project plan and roadmap.

## Status

Currently in early development. Landing page is live, working on core features.
