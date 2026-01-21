"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getVerifiedEmail } from "@/lib/verified-email"
import { saveVoterEmail } from "@/lib/voter-email"
import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { useAuth } from "@/components/auth/auth-provider"

interface AddCommentFormProps {
  postId: string
  onSuccess?: () => void
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

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    saveVoterEmail(email) // Save for display purposes
  }

  // Collapsed state - just a button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
      >
        Add a comment...
      </button>
    )
  }

  // Expanded state - need to verify email first if not already verified
  if (!verifiedEmail) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-2">
        <p className="text-sm text-muted-foreground">
          Verify your email to comment
        </p>
        <EmailVerificationForm
          onVerified={handleVerified}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    )
  }

  // Verified - show comment form
  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Commenting as</span>
        <span className="font-medium text-foreground">{verifiedEmail}</span>
      </div>

      <div className="space-y-1">
        <Textarea
          id={`comment-content-${postId}`}
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={loading}
          rows={2}
          className="text-sm resize-none"
          autoFocus
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false)
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
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  )
}
