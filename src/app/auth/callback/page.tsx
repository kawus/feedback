"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { removeBoardToken } from "@/lib/board-tokens"

function AuthCallbackContent() {
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

      // For magic links, Supabase puts tokens in the URL hash
      // We need to let Supabase client handle this automatically
      // by checking if there's a hash and letting it process
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      // If we have tokens in the hash, set the session
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setStatus("error")
          setMessage("Failed to verify your email. Please try again.")
          return
        }
      }

      // Now get the session to verify we're authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession()

      if (authError || !session) {
        setStatus("error")
        setMessage("Failed to verify your email. Please try again.")
        return
      }

      // Check if we need to claim a board
      const claimSlug = searchParams.get("claim")
      const claimToken = searchParams.get("token")
      const redirectTo = searchParams.get("redirect")

      if (claimSlug && claimToken) {
        setMessage("Claiming your board...")

        // Call API to claim the board - pass the access token
        const response = await fetch("/api/boards/claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ slug: claimSlug, claimToken }),
        })

        if (response.ok) {
          // Remove the token from localStorage since board is now claimed
          removeBoardToken(claimSlug)
          setStatus("success")
          setMessage("Board claimed! Redirecting...")

          // Redirect to specified URL or the board
          setTimeout(() => {
            router.push(redirectTo || `/b/${claimSlug}`)
          }, 1500)
          return
        } else {
          const data = await response.json()
          setStatus("error")
          setMessage(data.error || "Failed to claim board")
          return
        }
      }

      // No board to claim, just redirect to specified URL or home
      setStatus("success")
      setMessage("Signed in! Redirecting...")
      setTimeout(() => {
        router.push(redirectTo || "/")
      }, 1500)
    }

    handleCallback()
  }, [router, searchParams])

  return (
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
  )
}

function LoadingFallback() {
  return (
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-foreground font-medium">Loading...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Suspense fallback={<LoadingFallback />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  )
}
