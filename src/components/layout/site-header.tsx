"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { getBoardTokens } from "@/lib/board-tokens"
import { signOut } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const [signingOut, setSigningOut] = useState(false)

  // Use useSyncExternalStore for hydration-safe localStorage access
  const hasBoardTokens = useSyncExternalStore(
    subscribeToBoardTokens,
    getHasBoardTokens,
    getServerSnapshot
  )

  // Determine which link to show:
  // - Avatar dropdown if user is signed in
  // - "My Boards" if user has localStorage tokens but not signed in
  // - "Sign In" otherwise (gives entry point from any browser)
  const hasBoards = hasBoardTokens || user
  const showAuthLink = !loading

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    window.location.href = "/"
  }

  // Get user initials for avatar
  const getUserInitial = () => {
    if (!user?.email) return "?"
    return user.email.charAt(0).toUpperCase()
  }

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
          {showAuthLink && (
            user ? (
              // Signed in: Show avatar dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-boards" className="cursor-pointer">
                      My Boards
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="cursor-pointer"
                  >
                    {signingOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : hasBoards ? (
              // Not signed in but has boards: Show "My Boards" link
              <Link
                href="/my-boards"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                My Boards
              </Link>
            ) : (
              // No boards, no auth: Show "Sign In" link
              <Link
                href="/signin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )
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
