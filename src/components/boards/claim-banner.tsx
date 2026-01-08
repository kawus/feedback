"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ClaimBannerProps {
  onDismiss?: () => void
}

export function ClaimBanner({ onDismiss }: ClaimBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
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
          <Button size="sm" disabled title="Coming soon">
            Sign up
          </Button>
        </div>
      </div>
    </div>
  )
}
