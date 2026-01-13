"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { sendMagicLink } from "@/lib/auth"
import { getBoardToken } from "@/lib/board-tokens"

interface ClaimBannerProps {
  boardSlug: string
  onDismiss?: () => void
}

export function ClaimBanner({ boardSlug, onDismiss }: ClaimBannerProps) {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
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
          We sent a link to <strong>{email}</strong>. Click it to claim this
          board.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      {!showForm ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground text-sm">
              This board is saved to your browser
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create an account to access it from anywhere and unlock admin
              features.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Later
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              Claim board
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="font-semibold text-foreground text-sm mb-3">
              Enter your email to claim this board
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
              <Button type="submit" size="sm" disabled={loading || !email}>
                {loading ? "Sending..." : "Send link"}
              </Button>
              <Button
                type="button"
                variant="outline"
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
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll send you a magic link. No password needed.
          </p>
        </form>
      )}
    </div>
  )
}
