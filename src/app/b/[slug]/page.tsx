"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isMyBoard, getBoardToken } from "@/lib/board-tokens"
import { sendMagicLink } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"
import { Board, Post } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubmitFeedbackForm } from "@/components/boards/submit-feedback-form"
import { FeedbackList } from "@/components/boards/feedback-list"
import { ClaimBanner } from "@/components/boards/claim-banner"
import { PoweredByBadge } from "@/components/boards/powered-by-badge"

export default function BoardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()

  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [hasClaimToken, setHasClaimToken] = useState(false)

  // Inline claim form state
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimEmail, setClaimEmail] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimSent, setClaimSent] = useState(false)

  // Fetch board and posts
  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Fetch board by slug
    const { data: boardData, error: boardError } = await supabase
      .from("boards")
      .select("id, user_id, name, slug, expires_at, created_at")
      .eq("slug", slug)
      .single()

    if (boardError || !boardData) {
      setNotFoundState(true)
      setLoading(false)
      return
    }

    setBoard(boardData)

    // Check ownership: either via claim token (localStorage) or logged-in user
    const hasToken = isMyBoard(slug)
    setHasClaimToken(hasToken)

    // User owns board if they have the claim token OR if they're logged in and board belongs to them
    const ownsViaAuth = user && boardData.user_id === user.id
    setIsOwner(hasToken || !!ownsViaAuth)

    // Fetch posts for this board
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("board_id", boardData.id)
      .order("created_at", { ascending: false })

    setPosts(postsData || [])
    setLoading(false)
  }, [slug, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subscribe to realtime updates for posts (vote counts, new posts, deletions)
  useEffect(() => {
    if (!supabase || !board?.id) return

    const channel = supabase
      .channel(`board-${board.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          // Update the specific post in local state (includes vote_count changes)
          setPosts((currentPosts) =>
            currentPosts.map((post) =>
              post.id === payload.new.id
                ? { ...post, ...payload.new as Post }
                : post
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          // Add new post to the top of the list
          setPosts((currentPosts) => [payload.new as Post, ...currentPosts])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          // Remove deleted post from list
          setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [board?.id])

  // Handle inline claim submission
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimEmail.trim()) return

    setClaimLoading(true)
    const claimToken = getBoardToken(slug)
    const redirectUrl = `${window.location.origin}/auth/callback?claim=${slug}&token=${claimToken}`

    const { error } = await sendMagicLink(claimEmail, redirectUrl)
    setClaimLoading(false)

    if (!error) {
      setClaimSent(true)
    }
  }

  // Handle not found
  if (notFoundState) {
    notFound()
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  if (!board) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                F
              </span>
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              FeedbackApp
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Claim banner - only show for unclaimed boards (user has token but not logged in) */}
        {hasClaimToken && <ClaimBanner boardSlug={slug} />}

        {/* Board title + navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              {board.name}
            </h1>
            {isOwner && (
              <Badge variant="secondary" className="text-xs">
                Admin
              </Badge>
            )}
            {/* Unclaimed indicator - always visible for unclaimed boards */}
            {hasClaimToken && !board.user_id && (
              <div className="flex items-center gap-2">
                {claimSent ? (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Check your email for the claim link
                  </span>
                ) : showClaimForm ? (
                  <form onSubmit={handleClaim} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      className="h-7 text-xs w-40"
                      required
                      disabled={claimLoading}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={claimLoading || !claimEmail.trim()}
                    >
                      {claimLoading ? "..." : "Send"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowClaimForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowClaimForm(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Unclaimed · <span className="underline">Claim to keep</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/b/${slug}/roadmap`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href={`/b/${slug}/changelog`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
            {isOwner && (
              <Link
                href={`/b/${slug}/settings`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            )}
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feedback list */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <FeedbackList
              posts={posts}
              boardSlug={slug}
              isOwner={isOwner}
              onVoteChange={fetchData}
            />
          </div>

          {/* Submit form */}
          <div className="order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <SubmitFeedbackForm boardId={board.id} onSuccess={fetchData} />
              </CardContent>
            </Card>
          </div>
        </div>

        <PoweredByBadge />
      </main>
    </div>
  )
}
