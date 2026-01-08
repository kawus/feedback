// Store voter email in localStorage for repeat voting

const STORAGE_KEY = 'fb_voter_email';

export function getVoterEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function saveVoterEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim());
}

export function clearVoterEmail(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
