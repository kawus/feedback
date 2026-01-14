"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getVoterEmail, saveVoterEmail } from "@/lib/voter-email"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface VoteButtonProps {
  postId: string
  voteCount: number
  onVoteChange?: () => void
}

export function VoteButton({ postId, voteCount, onVoteChange }: VoteButtonProps) {
  // Track voter email in state so we can react to changes
  const [voterEmail, setVoterEmail] = useState<string | null>(null)
  const [count, setCount] = useState(Math.max(0, voteCount))
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  // Sync count from props when parent refetches (bounds check: never negative)
  useEffect(() => {
    setCount(Math.max(0, voteCount))
  }, [voteCount])

  // Load voter email from localStorage on mount
  useEffect(() => {
    const email = getVoterEmail()
    setVoterEmail(email)
  }, [])

  // Check if user has already voted - re-run when postId or voterEmail changes
  useEffect(() => {
    async function checkVote() {
      if (!voterEmail || !supabase) {
        setHasVoted(false)
        return
      }

      const { data } = await supabase
        .from("votes")
        .select("id")
        .eq("post_id", postId)
        .eq("voter_email", voterEmail)
        .single()

      setHasVoted(!!data)
    }
    checkVote()
  }, [postId, voterEmail])

  const handleVote = async (emailToUse: string) => {
    if (!supabase) return

    setLoading(true)
    setError("")

    const normalizedEmail = emailToUse.trim().toLowerCase()

    if (hasVoted) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("voter_email", normalizedEmail)

      if (deleteError) {
        setError("Failed to remove vote")
        setLoading(false)
        return
      }

      // Update hasVoted state, but DON'T update count locally
      // Let parent refetch to get accurate count from database
      setHasVoted(false)
    } else {
      // Add vote
      const { error: insertError } = await supabase
        .from("votes")
        .insert({ post_id: postId, voter_email: normalizedEmail })

      if (insertError) {
        // Already voted (duplicate key)
        if (insertError.code === "23505") {
          setHasVoted(true)
        } else {
          setError("Failed to vote")
        }
        setLoading(false)
        return
      }

      // Update hasVoted state and save email
      setHasVoted(true)
      saveVoterEmail(normalizedEmail)
      setVoterEmail(normalizedEmail)
      // DON'T update count locally - let parent refetch
    }

    setLoading(false)
    setShowEmailInput(false)
    // Trigger parent to refetch posts with accurate vote_count from database
    onVoteChange?.()
  }

  const handleClick = () => {
    if (voterEmail) {
      handleVote(voterEmail)
    } else {
      setShowEmailInput(true)
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      handleVote(email.trim().toLowerCase())
    }
  }

  // Email input mode
  if (showEmailInput) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-[80px]">
        <form onSubmit={handleEmailSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="text-xs h-8 w-32"
          />
          <div className="flex gap-1">
            <Button type="submit" size="sm" className="text-xs h-7 flex-1" disabled={loading}>
              Vote
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setShowEmailInput(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    )
  }

  // Vote button
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-md transition-all duration-200 ease-out ${
        hasVoted
          ? "bg-primary/10 border-2 border-primary text-primary"
          : "bg-muted border-2 border-transparent hover:border-primary/30 hover:bg-primary/5"
      } ${loading ? "opacity-50" : "hover:-translate-y-0.5"}`}
    >
      <svg
        className={`w-4 h-4 mb-0.5 transition-transform ${hasVoted ? "text-primary" : "text-muted-foreground"}`}
        fill={hasVoted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span className={`text-lg font-semibold ${hasVoted ? "text-primary" : "text-foreground"}`}>
        {count}
      </span>
      <span className="text-xs text-muted-foreground">
        {count === 1 ? "vote" : "votes"}
      </span>
    </button>
  )
}
