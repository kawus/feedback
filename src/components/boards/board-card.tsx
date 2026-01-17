"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMagicLink } from "@/lib/auth"
import { getBoardToken } from "@/lib/board-tokens"

interface BoardCardProps {
  board: {
    id: string
    name: string
    slug: string
    created_at: string
    expires_at: string | null
    post_count: number
  }
  claimed: boolean
  onClaimSent?: () => void
}

// Format date as "Jan 15, 2026"
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Calculate days until expiration
function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const days = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  return days
}

export function BoardCard({ board, claimed, onClaimSent }: BoardCardProps) {
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const daysUntilExpiry = getDaysUntilExpiry(board.expires_at)

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const claimToken = getBoardToken(board.slug)
    const redirectUrl = `${window.location.origin}/auth/callback?claim=${board.slug}&token=${claimToken}&redirect=/my-boards`

    const { error: authError } = await sendMagicLink(email, redirectUrl)

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSent(true)
    onClaimSent?.()
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-[var(--shadow-sm)] transition-all duration-200 ease-out hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        {/* Left side: Board info */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/b/${board.slug}`}
            className="font-semibold text-foreground hover:underline tracking-tight"
          >
            {board.name}
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Created {formatDate(board.created_at)} · {board.post_count}{" "}
            {board.post_count === 1 ? "post" : "posts"}
          </p>

          {/* Expiration warning for unclaimed */}
          {!claimed && daysUntilExpiry !== null && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {daysUntilExpiry > 0
                ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`
                : "Expires soon!"}
            </p>
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {claimed ? (
            // Claimed: Show secured badge
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Secured
            </span>
          ) : sent ? (
            // Claim email sent
            <span className="text-xs text-green-600 dark:text-green-400">
              Check your email!
            </span>
          ) : showClaimForm ? (
            // Inline claim form
            <form onSubmit={handleClaim} className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 text-xs w-40"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={loading || !email}
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? "..." : "Send"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowClaimForm(false)
                  setError("")
                }}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </form>
          ) : (
            // Claim button
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20"
              onClick={() => setShowClaimForm(true)}
            >
              Claim with email
            </Button>
          )}

          {/* Link to board */}
          <Link
            href={`/b/${board.slug}`}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-destructive text-xs mt-2">{error}</p>
      )}
    </div>
  )
}
