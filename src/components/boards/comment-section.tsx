"use client"

import { useState, useEffect, useCallback } from "react"
import { Comment } from "@/types/database"
import { supabase } from "@/lib/supabase"
import { CommentItem } from "./comment-item"
import { AddCommentForm } from "./add-comment-form"

interface CommentSectionProps {
  postId: string
  boardSlug: string
  isOwner: boolean
  initialCommentCount: number
}

export function CommentSection({
  postId,
  boardSlug,
  isOwner,
  initialCommentCount,
}: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(initialCommentCount)

  // Fetch comments when section is opened
  const fetchComments = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setComments(data)
      setCommentCount(data.length)
    }
    setLoading(false)
  }, [postId])

  // Open and fetch comments
  const handleOpen = () => {
    setIsOpen(true)
    fetchComments()
  }

  // Subscribe to realtime updates when section is open
  useEffect(() => {
    if (!supabase || !isOpen) return

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setComments((current) => [...current, payload.new as Comment])
          setCommentCount((c) => c + 1)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setComments((current) =>
            current.filter((c) => c.id !== payload.old.id)
          )
          setCommentCount((c) => Math.max(0, c - 1))
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [postId, isOpen])

  // Collapsed state - just the count
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {commentCount === 0 ? (
          "Add comment"
        ) : (
          <>
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </>
        )}
      </button>
    )
  }

  // Expanded state - full comment section
  return (
    <div className="mt-4 pt-4 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">
          Comments {commentCount > 0 && `(${commentCount})`}
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Hide
        </button>
      </div>

      {/* Add comment form - at the TOP */}
      <div className="mb-4">
        <AddCommentForm postId={postId} onSuccess={fetchComments} />
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="py-6 text-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <CommentItem
                comment={comment}
                boardSlug={boardSlug}
                isOwner={isOwner}
                onDelete={fetchComments}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
