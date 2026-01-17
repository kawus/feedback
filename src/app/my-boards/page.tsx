"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { SiteHeader } from "@/components/layout/site-header"
import { BoardCard } from "@/components/boards/board-card"
import { Button } from "@/components/ui/button"
import { getBoardTokens, removeBoardToken } from "@/lib/board-tokens"
import { supabase } from "@/lib/supabase"

interface BoardWithStats {
  id: string
  name: string
  slug: string
  user_id: string | null
  created_at: string
  expires_at: string | null
  post_count: number
}

export default function MyBoardsPage() {
  const { user, loading: authLoading } = useAuth()

  const [localBoards, setLocalBoards] = useState<BoardWithStats[]>([])
  const [claimedBoards, setClaimedBoards] = useState<BoardWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBoards() {
      if (!supabase) {
        setLoading(false)
        return
      }

      // Get localStorage board slugs
      const tokens = getBoardTokens()
      const localSlugs = Object.keys(tokens)

      // Fetch boards from localStorage slugs
      let localBoardsData: BoardWithStats[] = []
      if (localSlugs.length > 0) {
        const { data } = await supabase
          .from("boards")
          .select("id, name, slug, user_id, created_at, expires_at, posts(count)")
          .in("slug", localSlugs)

        if (data) {
          // Process boards and clean up stale tokens
          localBoardsData = data
            .filter((board) => {
              // If board is claimed by someone else, remove the token
              if (board.user_id !== null) {
                // Check if claimed by current user
                if (user && board.user_id === user.id) {
                  // This is ours via account, will show in claimed section
                  removeBoardToken(board.slug)
                  return false
                }
                // Claimed by someone else, remove token
                removeBoardToken(board.slug)
                return false
              }
              return true
            })
            .map((b) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              user_id: b.user_id,
              created_at: b.created_at,
              expires_at: b.expires_at,
              post_count: (b.posts as { count: number }[])?.[0]?.count || 0,
            }))

          // Clean up tokens for boards that no longer exist
          const foundSlugs = data.map((b) => b.slug)
          localSlugs.forEach((slug) => {
            if (!foundSlugs.includes(slug)) {
              removeBoardToken(slug)
            }
          })
        }
      }

      // Fetch claimed boards if user is logged in
      let claimedBoardsData: BoardWithStats[] = []
      if (user) {
        const { data } = await supabase
          .from("boards")
          .select("id, name, slug, user_id, created_at, expires_at, posts(count)")
          .eq("user_id", user.id)

        if (data) {
          claimedBoardsData = data.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            user_id: b.user_id,
            created_at: b.created_at,
            expires_at: b.expires_at,
            post_count: (b.posts as { count: number }[])?.[0]?.count || 0,
          }))
        }
      }

      setLocalBoards(localBoardsData)
      setClaimedBoards(claimedBoardsData)
      setLoading(false)
    }

    // Wait for auth to resolve before fetching
    if (!authLoading) {
      fetchBoards()
    }
  }, [user, authLoading])

  const hasAnyBoards = localBoards.length > 0 || claimedBoards.length > 0
  const showSignInPrompt = !user && localBoards.length > 0

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            My Boards
          </h1>
          <Button asChild>
            <Link href="/create">+ Create new</Link>
          </Button>
        </div>

        {/* Loading state */}
        {loading || authLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 bg-muted rounded-lg animate-shimmer"
              />
            ))}
          </div>
        ) : !hasAnyBoards ? (
          // Empty state - no boards at all
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No boards yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first feedback board in seconds. No account required.
            </p>
            <Button asChild>
              <Link href="/create">Create a board</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unclaimed boards section */}
            {localBoards.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-amber-500"
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
                  <h2 className="font-semibold text-foreground">
                    Unclaimed Boards
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  These boards are only saved in this browser. Claim them to
                  access from anywhere and prevent losing your feedback.
                </p>
                <div className="space-y-3">
                  {localBoards.map((board) => (
                    <BoardCard key={board.id} board={board} claimed={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Claimed boards section */}
            {claimedBoards.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <h2 className="font-semibold text-foreground">
                    Your Claimed Boards
                  </h2>
                </div>
                <div className="space-y-3">
                  {claimedBoards.map((board) => (
                    <BoardCard key={board.id} board={board} claimed />
                  ))}
                </div>
              </section>
            )}

            {/* Sign in prompt for unauthenticated users with local boards */}
            {showSignInPrompt && (
              <div className="border border-border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Sign in to see boards you&apos;ve claimed on other devices.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
