"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { sendMagicLink } from "@/lib/auth"
import { getBoardToken } from "@/lib/board-tokens"
import { getVerifiedEmail } from "@/lib/verified-email"

interface ClaimBannerProps {
  boardSlug: string
  onDismiss?: () => void
}

export function ClaimBanner({ boardSlug, onDismiss }: ClaimBannerProps) {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState(() => getVerifiedEmail() || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Don't show if user is already logged in or banner dismissed
  if (user || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Store the claim token and board slug in the redirect URL
    // so we can claim the board after auth
    const claimToken = getBoardToken(boardSlug)
    const redirectUrl = `${window.location.origin}/auth/callback?claim=${boardSlug}&token=${claimToken}`

    const { error: authError } = await sendMagicLink(email, redirectUrl)

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <p className="font-semibold text-green-800 dark:text-green-200 text-sm">
          Check your email!
        </p>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          We sent a link to <strong>{email}</strong>. Click it to secure this
          board.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      {!showForm ? (
        <div className="flex items-start gap-3">
          {/* Warning icon */}
          <div className="shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
              This board is only saved in your browser
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              Secure it to access from any device and never lose it.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDismiss}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
            >
              Dismiss
            </button>
            <Button size="sm" onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
              Secure with email
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            {/* Lock icon */}
            <div className="shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-2">
                Enter your email to secure this board
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={loading || !email} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {loading ? "Sending..." : "Send link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2">
                We&apos;ll send you a magic link. No password needed.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
