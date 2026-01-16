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

interface BoardCreatedModalProps {
  open: boolean
  boardName: string
  boardSlug: string
}

export function BoardCreatedModal({ open, boardName, boardSlug }: BoardCreatedModalProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

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
