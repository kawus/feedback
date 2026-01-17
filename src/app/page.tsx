"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/layout/site-header"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  // Fetch waitlist count on page load
  useEffect(() => {
    async function fetchCount() {
      if (!supabase) return
      const { data } = await supabase.rpc("get_waitlist_count")
      if (data !== null) setWaitlistCount(data)
    }
    fetchCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Check if Supabase is configured
    if (!supabase) {
      setError("Service unavailable. Please try again later.")
      setLoading(false)
      return
    }

    // Save email to Supabase waitlist table
    const { error: supabaseError } = await supabase
      .from("waitlist")
      .insert({ email })

    setLoading(false)

    if (supabaseError) {
      // Handle duplicate email gracefully
      if (supabaseError.code === "23505") {
        setError("You're already on the list!")
      } else {
        setError("Something went wrong. Please try again.")
      }
      return
    }

    setSubmitted(true)
    // Update the count after successful signup
    setWaitlistCount((prev) => (prev !== null ? prev + 1 : 1))
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader showComingSoon />

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <section className="py-20 md:py-32">
          <div className="max-w-2xl">
            {/* Tagline */}
            <p className="text-sm font-medium text-muted-foreground mb-4">
              The simpler alternative to Canny
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight mb-6">
              User feedback
              <br />
              made stupidly simple
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Collect feedback, let users vote, share your roadmap, and announce updates.
              All in one beautiful place. Set up in under 2 minutes.
            </p>

            {/* Email capture */}
            {!submitted ? (
              <div className="max-w-md">
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Joining..." : "Get Early Access"}
                  </Button>
                </form>
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>
            ) : (
              <div className="bg-muted border border-border rounded-lg p-4 max-w-md shadow-[var(--shadow-sm)]">
                <p className="text-foreground font-semibold">You're on the list!</p>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  We'll let you know when we launch.
                </p>
              </div>
            )}

            {/* Social proof hint */}
            {waitlistCount !== null && waitlistCount > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Join {waitlistCount} {waitlistCount === 1 ? "other" : "others"} waiting for launch
              </p>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="Feedback Board"
              description="Let users submit feature requests and ideas. Simple form, no friction."
            />
            <FeatureCard
              title="Voting"
              description="Users upvote what matters most. See what your community really wants."
            />
            <FeatureCard
              title="Public Roadmap"
              description="Share what's planned, in progress, and done. Build in public."
            />
            <FeatureCard
              title="Changelog"
              description="Announce new features and updates. Keep users in the loop."
            />
          </div>
        </section>

        {/* Why different */}
        <section className="py-16 border-t border-border">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-8">
            Why not Canny?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <CompareCard
              title="Transparent pricing"
              description="Know what you'll pay upfront. No sales calls, no surprises."
            />
            <CompareCard
              title="Set up in 2 minutes"
              description="Not 2 hours. Paste a script, you're live. That's it."
            />
            <CompareCard
              title="Built for indie makers"
              description="Not enterprise. No feature bloat. Just what you need."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-muted-foreground">
            Built by an indie maker, for indie makers.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function CompareCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <h3 className="font-semibold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
