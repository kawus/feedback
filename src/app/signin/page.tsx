"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMagicLink } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"

export default function SignInPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to My Boards if already signed in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/my-boards")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Build redirect URL to land on My Boards after auth
    const redirectUrl = `${window.location.origin}/auth/callback?redirect=/my-boards`

    const { error: sendError } = await sendMagicLink(email, redirectUrl)

    setLoading(false)

    if (sendError) {
      setError(sendError.message)
      return
    }

    setSent(true)
  }

  // Don't render form while checking auth (prevents flash)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-24">
          <div className="h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  // If user is logged in, show nothing (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-md px-6 py-24">
        <div className="text-center mb-8">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
            Sign in to FeedbackApp
          </h1>
          <p className="text-muted-foreground">
            Access your feedback boards from any device.
          </p>
        </div>

        {sent ? (
          // Success state - email sent
          <div className="text-center p-6 bg-muted/50 rounded-lg border border-border">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-foreground mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground mb-2">
              We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Click the link in the email to sign in. No code needed.
            </p>
            <button
              onClick={() => {
                setSent(false)
                setEmail("")
              }}
              className="text-sm text-primary hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          // Email form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-12 text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Send magic link"}
            </Button>
          </form>
        )}

        {/* Divider and alternative CTA */}
        {!sent && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Don&apos;t have a board yet?
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/create">Create one - no account needed</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
