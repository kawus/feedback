"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { getVerifiedEmail } from "@/lib/verified-email"
import { saveVoterEmail } from "@/lib/voter-email"
import { isMyBoard } from "@/lib/board-tokens"
import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "@/components/ui/sonner"

interface VoteButtonProps {
  postId: string
  voteCount: number
  onVoteChange?: () => void
  boardSlug?: string // For secure suggestion after voting
  boardClaimed?: boolean // Whether the board is already claimed
  onSecureClick?: () => void // Called when user clicks "Secure now" in toast
}

export function VoteButton({ postId, voteCount, onVoteChange, boardSlug, boardClaimed, onSecureClick }: VoteButtonProps) {
  const { user } = useAuth()
  // Track verified email in state so we can react to changes
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [count, setCount] = useState(Math.max(0, voteCount))
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [error, setError] = useState("")

  // Animation state
  const [animating, setAnimating] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync count from props when parent refetches (bounds check: never negative)
  useEffect(() => {
    setCount(Math.max(0, voteCount))
  }, [voteCount])

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Trigger animation (called after successful vote)
  const triggerAnimation = () => {
    setAnimating(true)
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    // Remove animation class after animation completes
    animationTimeoutRef.current = setTimeout(() => {
      setAnimating(false)
    }, 300)
  }

  // Use authenticated user's email, or check for OTP-verified email
  useEffect(() => {
    if (user?.email) {
      setVerifiedEmail(user.email)
    } else {
      const email = getVerifiedEmail()
      setVerifiedEmail(email)
    }
  }, [user])

  // Check if user has already voted - re-run when postId or verifiedEmail changes
  useEffect(() => {
    async function checkVote() {
      if (!verifiedEmail || !supabase) {
        setHasVoted(false)
        return
      }

      const { data } = await supabase
        .from("votes")
        .select("id")
        .eq("post_id", postId)
        .eq("voter_email", verifiedEmail)
        .maybeSingle()

      setHasVoted(!!data)
    }
    checkVote()
  }, [postId, verifiedEmail])

  const handleVote = async (emailToUse: string, isFirstVote: boolean = false) => {
    if (!supabase) return

    setLoading(true)
    setError("")

    const normalizedEmail = emailToUse.trim().toLowerCase()

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("post_id", postId)
      .eq("voter_email", normalizedEmail)
      .maybeSingle()

    if (existingVote) {
      // User has voted - remove the vote
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
      setHasVoted(false)
      triggerAnimation()
    } else {
      // User hasn't voted - add a vote
      const { error: insertError } = await supabase
        .from("votes")
        .insert({ post_id: postId, voter_email: normalizedEmail })

      if (insertError) {
        setError("Failed to vote")
        setLoading(false)
        return
      }
      setHasVoted(true)
      // Also save as voter email for comment form pre-fill
      saveVoterEmail(normalizedEmail)
      setVerifiedEmail(normalizedEmail)
      triggerAnimation()

      // Show welcome toast for first-time voters
      if (isFirstVote) {
        // Check if this is the user's own unclaimed board
        const isOwnBoard = boardSlug && isMyBoard(boardSlug)
        const isUnclaimed = boardClaimed === false

        if (isOwnBoard && isUnclaimed && onSecureClick) {
          // Suggest securing the board with the email they just verified
          toast.success("Vote recorded", {
            description: "Want to secure this board with your verified email?",
            action: {
              label: "Secure now",
              onClick: onSecureClick,
            },
            duration: 8000,
          })
        } else {
          toast.success("Vote recorded", {
            description: "We'll update you when this ships.",
          })
        }
      }
    }

    // Refresh to get updated count
    onVoteChange?.()
    setLoading(false)
    setShowVerification(false)
  }

  const handleClick = () => {
    // Prevent double-clicks while loading
    if (loading) return

    // Authenticated users can vote directly
    if (user?.email) {
      handleVote(user.email)
      return
    }

    // Check for OTP-verified email
    const storedEmail = getVerifiedEmail()
    if (storedEmail) {
      handleVote(storedEmail)
    } else {
      // No verified email - show verification form
      setShowVerification(true)
    }
  }

  // Called when email verification completes
  const handleVerified = (email: string) => {
    // Verification complete - now submit the vote
    handleVote(email, true)
  }

  // Email verification mode
  if (showVerification) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-[140px]">
        <EmailVerificationForm
          onVerified={handleVerified}
          onCancel={() => setShowVerification(false)}
          compact
          context="vote"
        />
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
      } ${loading ? "opacity-50" : "hover:-translate-y-0.5"} ${animating ? "animate-vote-bump" : ""}`}
    >
      <svg
        className={`w-4 h-4 mb-0.5 transition-transform ${hasVoted ? "text-primary" : "text-muted-foreground"} ${animating ? "animate-vote-arrow" : ""}`}
        fill={hasVoted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span className={`text-lg font-semibold ${hasVoted ? "text-primary" : "text-foreground"} ${animating ? "animate-vote-count" : ""}`}>
        {count}
      </span>
      <span className="text-xs text-muted-foreground">
        {count === 1 ? "vote" : "votes"}
      </span>
    </button>
  )
}
