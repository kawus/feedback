// Board token management
// Stores claim tokens in localStorage to prove board ownership

const STORAGE_KEY = 'fb_board_tokens';

// Get all stored tokens as { slug: token } map
export function getBoardTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Get token for a specific board
export function getBoardToken(slug: string): string | null {
  const tokens = getBoardTokens();
  return tokens[slug] || null;
}

// Save token after creating a board
export function saveBoardToken(slug: string, token: string): void {
  if (typeof window === 'undefined') return;

  const tokens = getBoardTokens();
  tokens[slug] = token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

// Check if current user owns this board (has the claim token)
export function isMyBoard(slug: string): boolean {
  return getBoardToken(slug) !== null;
}

// Remove token (e.g., after claiming with account)
export function removeBoardToken(slug: string): void {
  if (typeof window === 'undefined') return;

  const tokens = getBoardTokens();
  delete tokens[slug];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}
