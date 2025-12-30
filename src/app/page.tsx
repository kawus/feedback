"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="font-semibold text-gray-900">FeedbackApp</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <section className="py-20 md:py-32">
          <div className="max-w-2xl">
            {/* Tagline */}
            <p className="text-sm font-medium text-gray-500 mb-4">
              The simpler alternative to Canny
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              User feedback
              <br />
              made stupidly simple
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Collect feedback, let users vote, share your roadmap, and announce updates.
              All in one beautiful place. Set up in under 2 minutes.
            </p>

            {/* Email capture */}
            {!submitted ? (
              <div className="max-w-md">
                <form onSubmit={handleSubmit} className="flex gap-3">
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
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md">
                <p className="text-gray-900 font-medium">You're on the list!</p>
                <p className="text-gray-600 text-sm mt-1">
                  We'll let you know when we launch.
                </p>
              </div>
            )}

            {/* Social proof hint */}
            <p className="text-sm text-gray-500 mt-4">
              Join 0 others waiting for launch
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-gray-100">
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
        <section className="py-16 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
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
      <footer className="border-t border-gray-100 mt-16">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-gray-500">
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
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function CompareCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
