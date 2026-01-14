# How Vote Sync Works in Supabase

## The Flow

```
User A votes → Database → Trigger updates vote_count → Realtime broadcasts → User B sees update
```

## Step by Step

### 1. User A clicks vote button
```
VoteButton → INSERT into `votes` table
```

### 2. Database trigger fires automatically
```sql
-- When a vote is inserted, this runs:
UPDATE posts SET vote_count = vote_count + 1 WHERE id = NEW.post_id;
```
The `SECURITY DEFINER` allows this to bypass Row Level Security.

### 3. Supabase Realtime detects the change
The `posts` table is in the realtime publication, so when `vote_count` changes, Supabase broadcasts it.

### 4. User B's browser receives the update
```typescript
// In page.tsx, we subscribe to posts changes:
supabase
  .channel(`board-${board.id}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'posts',
    filter: `board_id=eq.${board.id}`
  }, (payload) => {
    // Update local state with new vote_count
    setPosts(posts.map(p =>
      p.id === payload.new.id ? payload.new : p
    ))
  })
```

## Visual Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User A    │     │  Supabase   │     │   User B    │
│  (voting)   │     │  Database   │     │ (watching)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ INSERT vote       │                   │
       │──────────────────>│                   │
       │                   │                   │
       │            ┌──────┴──────┐            │
       │            │  Trigger:   │            │
       │            │  UPDATE     │            │
       │            │  vote_count │            │
       │            └──────┬──────┘            │
       │                   │                   │
       │                   │ Realtime broadcast│
       │                   │──────────────────>│
       │                   │                   │
       │ Refresh data      │      UI updates   │
       │<──────────────────│                   │
       │                   │                   │
```

## Why We Use This Approach

| Approach | Pros | Cons |
|----------|------|------|
| **Votes realtime** (what we tried first) | Direct | DELETE events don't include `post_id` without REPLICA IDENTITY |
| **Posts realtime** (what we use) | Reliable, trigger handles count | Slight delay, extra DB query |

## Key Supabase Concepts

### Realtime Publication
Tables must be added to `supabase_realtime` publication to broadcast changes:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

### Triggers
Database functions that run automatically on INSERT/UPDATE/DELETE:
```sql
CREATE TRIGGER vote_increment_trigger
AFTER INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION increment_vote_count();
```

### SECURITY DEFINER
Makes function run with creator's privileges (bypasses RLS):
```sql
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET vote_count = vote_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### RLS (Row Level Security)
Policies that control who can read/write data. Triggers need `SECURITY DEFINER` to bypass RLS when updating related tables.

## Required SQL Setup

```sql
-- 1. Create functions with SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET vote_count = vote_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_vote_count()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 2. Create triggers
CREATE TRIGGER vote_increment_trigger
AFTER INSERT ON votes FOR EACH ROW EXECUTE FUNCTION increment_vote_count();

CREATE TRIGGER vote_decrement_trigger
AFTER DELETE ON votes FOR EACH ROW EXECUTE FUNCTION decrement_vote_count();

-- 3. Enable realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- 4. Sync vote counts (run if counts are out of sync)
UPDATE posts p
SET vote_count = (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id);
```

## Troubleshooting

### Vote count not updating?
1. Check triggers exist: `SELECT * FROM information_schema.triggers WHERE event_object_table = 'votes';`
2. Check functions have SECURITY DEFINER
3. Sync counts manually with the UPDATE query above

### Realtime not working?
1. Check table is in publication: `SELECT * FROM pg_publication_tables;`
2. Verify subscription is active in browser console
3. For DELETE events, set `ALTER TABLE votes REPLICA IDENTITY FULL;`
