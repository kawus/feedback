"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveVerifiedEmail } from "@/lib/verified-email"

interface EmailVerificationFormProps {
  onVerified: (email: string) => void
  onCancel?: () => void
  initialEmail?: string
  compact?: boolean // For inline use in vote button
}

type Step = "email" | "otp"

export function EmailVerificationForm({
  onVerified,
  onCancel,
  initialEmail = "",
  compact = false,
}: EmailVerificationFormProps) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  const otpInputRef = useRef<HTMLInputElement>(null)

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus OTP input when switching to OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [step])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send code")
        setLoading(false)
        return
      }

      // Success - move to OTP step
      setStep("otp")
      setResendCooldown(60) // 60 second cooldown before resend
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: otp.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Verification failed")
        setLoading(false)
        return
      }

      // Success! Save verification locally and notify parent
      saveVerifiedEmail(data.email, new Date(data.expiresAt))
      onVerified(data.email)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to resend code")
      } else {
        setResendCooldown(60)
        setOtp("") // Clear old OTP
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUseAnotherEmail = () => {
    setStep("email")
    setOtp("")
    setError("")
  }

  // Email input step
  if (step === "email") {
    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <form onSubmit={handleSendOtp} className="space-y-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className={compact ? "text-xs h-8 w-32" : ""}
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              size={compact ? "sm" : "default"}
              className={compact ? "text-xs h-7 flex-1" : "flex-1"}
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Send code"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size={compact ? "sm" : "default"}
                className={compact ? "text-xs h-7" : ""}
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    )
  }

  // OTP verification step
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="text-sm text-muted-foreground">
        We sent a code to <span className="font-medium text-foreground">{email}</span>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-2">
        <Input
          ref={otpInputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => {
            // Only allow digits
            const value = e.target.value.replace(/\D/g, "")
            setOtp(value)
          }}
          required
          className={compact ? "text-xs h-8 w-32 tracking-widest text-center font-mono" : "tracking-widest text-center font-mono text-lg"}
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            size={compact ? "sm" : "default"}
            className={compact ? "text-xs h-7 flex-1" : "flex-1"}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={compact ? "text-xs h-7" : ""}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || loading}
          className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={handleUseAnotherEmail}
          disabled={loading}
          className="text-primary hover:underline disabled:opacity-50"
        >
          Use different email
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Check your spam folder if you don't see the email.
      </p>
    </div>
  )
}
