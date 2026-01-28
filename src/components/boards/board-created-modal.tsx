"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMagicLink } from "@/lib/auth"
import { getBoardToken } from "@/lib/board-tokens"
import { getVerifiedEmail } from "@/lib/verified-email"

interface BoardCreatedModalProps {
  open: boolean
  boardName: string
  boardSlug: string
}

export function BoardCreatedModal({ open, boardName, boardSlug }: BoardCreatedModalProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showSecureForm, setShowSecureForm] = useState(false)
  const [email, setEmail] = useState(() => getVerifiedEmail() || "")
  const [secureLoading, setSecureLoading] = useState(false)
  const [secureError, setSecureError] = useState("")
  const [secureSuccess, setSecureSuccess] = useState(false)

  const boardUrl = typeof window !== "undefined"
    ? `${window.location.origin}/b/${boardSlug}`
    : `/b/${boardSlug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boardUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = boardUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGoToBoard = () => {
    router.push(`/b/${boardSlug}`)
  }

  const handleSecure = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecureLoading(true)
    setSecureError("")

    const claimToken = getBoardToken(boardSlug)
    const redirectUrl = `${window.location.origin}/auth/callback?claim=${boardSlug}&token=${claimToken}&redirect=/b/${boardSlug}`

    const { error: authError } = await sendMagicLink(email, redirectUrl)

    setSecureLoading(false)

    if (authError) {
      setSecureError(authError.message)
      return
    }

    setSecureSuccess(true)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <DialogTitle className="text-center">Your board is ready!</DialogTitle>
          <DialogDescription className="text-center">
            Share this link with your users to start collecting feedback.
          </DialogDescription>
        </DialogHeader>

        {/* Board URL with copy button */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-md px-3 py-2 font-mono text-sm text-foreground overflow-hidden">
              <span className="truncate block">{boardUrl}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* What's next section */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">What&apos;s next?</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">1.</span>
              <span>Add your first feature idea to get started</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">2.</span>
              <span>Share the link with your users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">3.</span>
              <span>Watch votes come in and prioritize what to build</span>
            </li>
          </ul>
        </div>

        {/* Secure warning section */}
        <div className="mt-6 pt-4 border-t border-border">
          {secureSuccess ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Check your email!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Click the link we sent to <strong>{email}</strong> to secure your board. No code needed.
              </p>
            </div>
          ) : !showSecureForm ? (
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-amber-500"
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
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">This board is only saved in this browser.</span>{" "}
                  Secure it with your email to access from anywhere.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSecureForm(true)}
                className="shrink-0"
              >
                Secure now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSecure} className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter your email to secure this board forever.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={secureLoading}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={secureLoading || !email}>
                  {secureLoading ? "Sending..." : "Send link"}
                </Button>
              </div>
              {secureError && (
                <p className="text-destructive text-xs">{secureError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                We&apos;ll send you a link. No password needed.
              </p>
            </form>
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-2">
          <Button onClick={handleGoToBoard} className="w-full">
            Go to my board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
