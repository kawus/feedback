"use client"

import Link from "next/link"

export function PoweredByBadge() {
  return (
    <div className="mt-16 pt-8 border-t border-border flex justify-center">
      <Link
        href="https://woerk.vercel.app"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5 text-primary"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span>
          Powered by <span className="font-medium text-foreground">FeedbackApp</span>
        </span>
      </Link>
    </div>
  )
}
