"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { removeBoardToken } from "@/lib/board-tokens"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setStatus("error")
        setMessage("Service unavailable")
        return
      }

      // Get the auth code from URL (Supabase adds this)
      const { error: authError } = await supabase.auth.getSession()

      if (authError) {
        setStatus("error")
        setMessage("Failed to verify your email. Please try again.")
        return
      }

      // Check if we need to claim a board
      const claimSlug = searchParams.get("claim")
      const claimToken = searchParams.get("token")

      if (claimSlug && claimToken) {
        setMessage("Claiming your board...")

        // Call API to claim the board
        const response = await fetch("/api/boards/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: claimSlug, claimToken }),
        })

        if (response.ok) {
          // Remove the token from localStorage since board is now claimed
          removeBoardToken(claimSlug)
          setStatus("success")
          setMessage("Board claimed! Redirecting...")

          // Redirect to the board
          setTimeout(() => {
            router.push(`/b/${claimSlug}`)
          }, 1500)
          return
        } else {
          const data = await response.json()
          setStatus("error")
          setMessage(data.error || "Failed to claim board")
          return
        }
      }

      // No board to claim, just redirect home
      setStatus("success")
      setMessage("Signed in! Redirecting...")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}
        {status === "success" && (
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}
        <p className="text-foreground font-medium">{message}</p>
        {status === "error" && (
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Go to homepage
          </button>
        )}
      </div>
    </div>
  )
}
