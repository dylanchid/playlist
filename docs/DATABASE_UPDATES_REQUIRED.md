# Critical Database Updates Required for PRD Alignment

## Schema Updates Needed

### 1. Context-Required Sharing (Priority 1)
```sql
-- Add required context story to playlists
ALTER TABLE public.playlists 
ADD COLUMN IF NOT EXISTS context_story text NOT NULL DEFAULT '';

-- Create playlist shares table for contextual sharing
CREATE TABLE IF NOT EXISTS public.playlist_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  share_context text, -- Additional context for this specific share
  share_type varchar(20) DEFAULT 'friend', -- 'friend', 'public', 'group'
  created_at timestamp DEFAULT now()
);
```

### 2. Music Taste Compatibility System
```sql
-- Update user_follows to include compatibility scoring
ALTER TABLE public.user_follows 
ADD COLUMN IF NOT EXISTS compatibility_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS connection_source varchar(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'connected';

-- Add music preferences to user profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS music_preferences jsonb DEFAULT '{}';
```

### 3. Enhanced Reaction System
```sql
-- Replace simple likes with reaction system
CREATE TABLE IF NOT EXISTS public.playlist_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type varchar(20) NOT NULL, -- 'fire', 'perfect', 'thoughtful', 'energy'
  created_at timestamp DEFAULT now(),
  UNIQUE(playlist_id, user_id, reaction_type)
);

-- Enhanced comments with context response flag
ALTER TABLE public.playlist_comments 
ADD COLUMN IF NOT EXISTS responds_to_context boolean DEFAULT true;
```

### 4. Friend Activity Feed
```sql
CREATE TABLE IF NOT EXISTS public.friend_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type varchar(30) NOT NULL, -- 'shared_playlist', 'reacted', 'commented'
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  activity_metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_created ON public.friend_activities(user_id, created_at DESC);
```

## Type System Updates Required

### Update `types/database.ts`:
```typescript
// Add to Playlist interface
interface Playlist {
  // ... existing fields
  context_story: string; // Required for sharing
}

// Add new interfaces
interface PlaylistShare {
  id: string;
  playlist_id: string;
  shared_by: string;
  shared_with: string;
  share_context?: string;
  share_type: 'friend' | 'public' | 'group';
  created_at: string;
}

interface PlaylistReaction {
  id: string;
  playlist_id: string;
  user_id: string;
  reaction_type: 'fire' | 'perfect' | 'thoughtful' | 'energy';
  created_at: string;
}

interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'shared_playlist' | 'reacted' | 'commented';
  playlist_id: string;
  activity_metadata: any;
  created_at: string;
}
```

## Implementation Priority

1. **Immediate**: Context story requirement
2. **Week 1**: Reaction system replacement
3. **Week 2**: Friend activity feed
4. **Week 3**: Compatibility scoring system 