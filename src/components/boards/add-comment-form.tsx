"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getVerifiedEmail } from "@/lib/verified-email"
import { saveVoterEmail } from "@/lib/voter-email"
import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

interface AddCommentFormProps {
  postId: string
  onSuccess?: () => void
}

// Generate consistent color from email (same as comment-item)
const avatarColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
]

function getAvatarColor(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function getInitial(email: string): string {
  return email.charAt(0).toUpperCase()
}

function getEmailPrefix(email: string): string {
  return email.split("@")[0]
}

export function AddCommentForm({ postId, onSuccess }: AddCommentFormProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Use authenticated user's email, or check for OTP-verified email
  useEffect(() => {
    if (user?.email) {
      setVerifiedEmail(user.email)
    } else {
      const email = getVerifiedEmail()
      setVerifiedEmail(email)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifiedEmail) return

    setLoading(true)
    setError("")

    // Get auth token if user is signed in
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (user && supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
    }

    const response = await fetch("/api/comments", {
      method: "POST",
      headers,
      body: JSON.stringify({
        postId,
        authorEmail: verifiedEmail,
        content: content.trim(),
      }),
    })

    setLoading(false)

    if (!response.ok) {
      const data = await response.json()
      setError(data.error || "Failed to post comment")
      return
    }

    // Reset and close
    setContent("")
    setIsOpen(false)

    onSuccess?.()
  }

  // Called when verification completes
  const handleVerified = (email: string) => {
    setVerifiedEmail(email)
    saveVoterEmail(email)
  }

  // Collapsed state - styled button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 border border-border rounded-lg transition-colors"
      >
        Add a comment...
      </button>
    )
  }

  // Expanded state - need to verify email first if not already verified
  if (!verifiedEmail) {
    return (
      <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
        <p className="text-sm font-medium text-foreground">
          Verify your email to comment
        </p>
        <EmailVerificationForm
          onVerified={handleVerified}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    )
  }

  const avatarColor = getAvatarColor(verifiedEmail)
  const initial = getInitial(verifiedEmail)
  const emailPrefix = getEmailPrefix(verifiedEmail)

  // Verified - show comment form with avatar
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-muted/30 border border-border rounded-lg">
      {/* Header with avatar and email */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar size="sm">
          <AvatarFallback className={`${avatarColor} text-white text-xs font-medium`}>
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">{emailPrefix}</span>
      </div>

      {/* Textarea */}
      <Textarea
        id={`comment-content-${postId}`}
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        disabled={loading}
        rows={3}
        className="text-sm resize-none bg-background"
        autoFocus
      />

      {error && <p className="text-destructive text-xs mt-2">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false)
            setContent("")
            setError("")
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading || !content.trim()}
        >
          {loading ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  )
}
