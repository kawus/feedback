"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { getBoardTokens } from "@/lib/board-tokens"
import { Badge } from "@/components/ui/badge"

// Subscribe to localStorage changes for board tokens
function subscribeToBoardTokens(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getHasBoardTokens() {
  if (typeof window === "undefined") return false
  const tokens = getBoardTokens()
  return Object.keys(tokens).length > 0
}

// Server snapshot always returns false (no localStorage on server)
function getServerSnapshot() {
  return false
}

interface SiteHeaderProps {
  // Show the "Coming Soon" badge (for landing page)
  showComingSoon?: boolean
}

export function SiteHeader({ showComingSoon = false }: SiteHeaderProps) {
  const { user, loading } = useAuth()

  // Use useSyncExternalStore for hydration-safe localStorage access
  const hasBoardTokens = useSyncExternalStore(
    subscribeToBoardTokens,
    getHasBoardTokens,
    getServerSnapshot
  )

  // Show "My Boards" if:
  // 1. User has localStorage tokens (unclaimed boards), OR
  // 2. User is logged in (might have claimed boards)
  const showMyBoards = !loading && (hasBoardTokens || user)

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-semibold">F</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">
            FeedbackApp
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showMyBoards && (
            <Link
              href="/my-boards"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My Boards
            </Link>
          )}
          {showComingSoon && (
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
