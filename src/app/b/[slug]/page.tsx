"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isMyBoard } from "@/lib/board-tokens"
import { Board, Post } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitFeedbackForm } from "@/components/boards/submit-feedback-form"
import { FeedbackList } from "@/components/boards/feedback-list"
import { ClaimBanner } from "@/components/boards/claim-banner"

export default function BoardPage() {
  const params = useParams()
  const slug = params.slug as string

  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

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

    // Check if current user owns this board (has claim token in localStorage)
    setIsOwner(isMyBoard(slug))

    // Fetch posts for this board
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("board_id", boardData.id)
      .order("created_at", { ascending: false })

    setPosts(postsData || [])
    setLoading(false)
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
        {/* Claim banner for board owners */}
        {isOwner && <ClaimBanner />}

        {/* Board title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-8">
          {board.name}
        </h1>

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

        {/* Powered by badge */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              FeedbackApp
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
