// Database types for FeedbackApp
// These match the tables we created in Supabase

export interface Board {
  id: string;
  user_id: string | null; // NULL until board is claimed
  name: string;
  slug: string;
  expires_at: string | null; // NULL if claimed, otherwise 30 days from creation
  created_at: string;
}

// Board with claim_token - only used when creating a board
// The claim_token should NEVER be fetched from the database after creation
export interface BoardWithToken extends Board {
  claim_token: string;
}

export interface Post {
  id: string;
  board_id: string;
  title: string;
  description: string | null;
  status: PostStatus;
  vote_count: number;
  author_email: string;
  created_at: string;
}

export type PostStatus = 'open' | 'planned' | 'in_progress' | 'done';
