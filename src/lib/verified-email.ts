// Track verified email addresses with expiry
// After OTP verification, email is stored with expiry timestamp

const VERIFIED_EMAIL_KEY = 'fb_verified_email';
const VERIFIED_EXPIRY_KEY = 'fb_verified_expiry';

interface VerificationStatus {
  email: string;
  expiresAt: Date;
}

/**
 * Get the verified email if it exists and hasn't expired
 */
export function getVerifiedEmail(): string | null {
  if (typeof window === 'undefined') return null;

  const email = localStorage.getItem(VERIFIED_EMAIL_KEY);
  const expiryStr = localStorage.getItem(VERIFIED_EXPIRY_KEY);

  if (!email || !expiryStr) return null;

  const expiry = new Date(expiryStr);
  if (expiry < new Date()) {
    // Expired, clear it
    clearVerification();
    return null;
  }

  return email;
}

/**
 * Check if there's a valid verified email
 */
export function isEmailVerified(): boolean {
  return getVerifiedEmail() !== null;
}

/**
 * Save verified email with expiry date
 */
export function saveVerifiedEmail(email: string, expiresAt: Date): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERIFIED_EMAIL_KEY, email.toLowerCase().trim());
  localStorage.setItem(VERIFIED_EXPIRY_KEY, expiresAt.toISOString());
}

/**
 * Clear verification status (e.g., on logout or manual clear)
 */
export function clearVerification(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VERIFIED_EMAIL_KEY);
  localStorage.removeItem(VERIFIED_EXPIRY_KEY);
}

/**
 * Get full verification status including expiry
 */
export function getVerificationStatus(): VerificationStatus | null {
  if (typeof window === 'undefined') return null;

  const email = localStorage.getItem(VERIFIED_EMAIL_KEY);
  const expiryStr = localStorage.getItem(VERIFIED_EXPIRY_KEY);

  if (!email || !expiryStr) return null;

  const expiresAt = new Date(expiryStr);
  if (expiresAt < new Date()) {
    clearVerification();
    return null;
  }

  return { email, expiresAt };
}
