# 🔧 Technical Specifications - Playlist Sharing App

## Project Foundation

### Base: Supabase Next.js Starterpack
This project builds upon the official Supabase Next.js starterpack, which provides:
- Next.js 14 with App Router
- Supabase authentication with cookie-based sessions
- shadcn/ui component library
- Tailwind CSS styling
- TypeScript configuration
- React Query for server state management

## Architecture Overview

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **React Query** - Server state management and caching
- **React Context** - Client state management (replacing Zustand)
- **Framer Motion** - Animations and transitions

### Backend Stack
- **Supabase** - Database, Authentication, Real-time, Storage
- **Next.js API Routes** - Server-side logic and external API integration
- **PostgreSQL** - Primary database with Row Level Security
- **Spotify Web API** - Music platform integration
- **Apple Music API** - Music platform integration (future)

### Infrastructure
- **Vercel** - Hosting and deployment
- **Supabase** - Backend services
- **Edge Functions** - Serverless compute for complex operations

## Database Schema Extensions

### User Profile Extensions
Building on Supabase Auth users table:

```sql
-- Extend user profiles for playlist features
CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username varchar(50) UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  spotify_id varchar(255),
  apple_music_id varchar(255),
  spotify_access_token text,
  spotify_refresh_token text,
  spotify_token_expires_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Core Playlist Schema

```sql
-- Playlists table
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  platform varchar(20) CHECK (platform IN ('spotify', 'apple', 'custom')) NOT NULL,
  external_id varchar(255), -- Platform playlist ID
  external_url text,
  track_count integer DEFAULT 0,
  duration_ms bigint DEFAULT 0,
  cover_image_url text,
  is_public boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view public playlists" ON public.playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own playlists" ON public.playlists
  FOR ALL USING (auth.uid() = user_id);

-- Playlist tracks (for custom playlists)
CREATE TABLE public.playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  track_name varchar(255) NOT NULL,
  artist_name varchar(255) NOT NULL,
  album_name varchar(255),
  duration_ms integer,
  external_id varchar(255), -- Spotify/Apple track ID
  track_url text,
  position integer NOT NULL,
  added_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tracks visible with playlist" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own playlist tracks" ON public.playlist_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );
```

### Social Features Schema

```sql
-- Playlist likes
CREATE TABLE public.playlist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, playlist_id)
);

-- Enable RLS
ALTER TABLE public.playlist_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view likes" ON public.playlist_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON public.playlist_likes
  FOR ALL USING (auth.uid() = user_id);

-- User follows
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON public.user_follows
  FOR ALL USING (auth.uid() = follower_id);

-- Playlist analytics
CREATE TABLE public.playlist_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  played_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlist_plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Playlist owners can view plays" ON public.playlist_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_plays.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert plays" ON public.playlist_plays
  FOR INSERT WITH CHECK (true);
```

## TypeScript Type Definitions

### Database Types

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'created_at'>>;
      };
      playlist_tracks: {
        Row: PlaylistTrack;
        Insert: Omit<PlaylistTrack, 'id' | 'added_at'>;
        Update: Partial<Omit<PlaylistTrack, 'id' | 'playlist_id'>>;
      };
      playlist_likes: {
        Row: PlaylistLike;
        Insert: Omit<PlaylistLike, 'id' | 'created_at'>;
        Update: never;
      };
      user_follows: {
        Row: UserFollow;
        Insert: Omit<UserFollow, 'id' | 'created_at'>;
        Update: never;
      };
      playlist_plays: {
        Row: PlaylistPlay;
        Insert: Omit<PlaylistPlay, 'id' | 'played_at'>;
        Update: never;
      };
    };
  };
}

export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  spotify_id?: string;
  apple_music_id?: string;
  spotify_access_token?: string;
  spotify_refresh_token?: string;
  spotify_token_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  platform: 'spotify' | 'apple' | 'custom';
  external_id?: string;
  external_url?: string;
  track_count: number;
  duration_ms: number;
  cover_image_url?: string;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  duration_ms?: number;
  external_id?: string;
  track_url?: string;
  position: number;
  added_at: string;
}

export interface PlaylistLike {
  id: string;
  user_id: string;
  playlist_id: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PlaylistPlay {
  id: string;
  playlist_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  played_at: string;
}
```

### Extended Types

```typescript
// types/playlist.ts
export interface PlaylistWithUser extends Playlist {
  user_profiles: UserProfile;
  likes_count: number;
  plays_count: number;
  is_liked: boolean;
  tracks?: PlaylistTrack[];
}

export interface UserWithStats extends UserProfile {
  followers_count: number;
  following_count: number;
  playlists_count: number;
  is_following: boolean;
}

// types/spotify.ts
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
    items: SpotifyTrack[];
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  track: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    external_urls: {
      spotify: string;
    };
  };
}
```

## Component Architecture

### Component Organization
```
components/
├── ui/                     # shadcn/ui components (existing)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── avatar.tsx
├── auth/                   # Authentication (extend existing)
│   ├── auth-provider.tsx
│   ├── profile-setup.tsx
│   └── spotify-connect.tsx
├── layout/                 # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── footer.tsx
│   └── main-layout.tsx
├── playlists/              # Playlist components
│   ├── playlist-card.tsx
│   ├── playlist-grid.tsx
│   ├── playlist-form.tsx
│   ├── playlist-import.tsx
│   ├── playlist-player.tsx
│   └── playlist-share.tsx
├── users/                  # User components
│   ├── user-profile.tsx
│   ├── user-card.tsx
│   ├── user-stats.tsx
│   └── follow-button.tsx
├── social/                 # Social features
│   ├── like-button.tsx
│   ├── share-button.tsx
│   ├── activity-feed.tsx
│   └── trending-section.tsx
└── common/                 # Shared components
    ├── search-bar.tsx
    ├── tag-input.tsx
    ├── loading-skeleton.tsx
    ├── error-boundary.tsx
    └── infinite-scroll.tsx
```

## State Management Strategy

### React Query + Context Pattern

```typescript
// contexts/playlist-context.tsx
interface PlaylistContextType {
  currentPlaylist: PlaylistWithUser | null;
  setCurrentPlaylist: (playlist: PlaylistWithUser | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

// hooks/use-playlists.ts
export function usePlaylists(filters?: PlaylistFilters) {
  return useQuery({
    queryKey: ['playlists', filters],
    queryFn: () => fetchPlaylists(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlaylistMutations() {
  const queryClient = useQueryClient();
  
  const likePlaylist = useMutation({
    mutationFn: (playlistId: string) => togglePlaylistLike(playlistId),
    onMutate: async (playlistId) => {
      // Optimistic update
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
  
  return { likePlaylist };
}
```

## API Integration

### Spotify Web API Integration

```typescript
// lib/spotify.ts
export class SpotifyAPI {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    const data = await response.json();
    return data.items;
  }
  
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }
    
    const data = await response.json();
    return data.items;
  }
}

// API Routes
// app/api/spotify/auth/route.ts - OAuth flow
// app/api/spotify/playlists/route.ts - Fetch user playlists
// app/api/spotify/import/route.ts - Import specific playlist
// app/api/spotify/refresh/route.ts - Refresh access token
```

### Supabase Integration

```typescript
// lib/supabase/playlists.ts
export async function fetchPlaylists(
  supabase: SupabaseClient,
  filters?: PlaylistFilters
): Promise<PlaylistWithUser[]> {
  let query = supabase
    .from('playlists')
    .select(`
      *,
      user_profiles (
        id,
        username,
        avatar_url
      ),
      playlist_likes (count),
      playlist_plays (count)
    `)
    .eq('is_public', true);
    
  if (filters?.tags?.length) {
    query = query.overlaps('tags', filters.tags);
  }
  
  if (filters?.platform) {
    query = query.eq('platform', filters.platform);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPlaylist(
  supabase: SupabaseClient,
  playlist: Database['public']['Tables']['playlists']['Insert']
): Promise<Playlist> {
  const { data, error } = await supabase
    .from('playlists')
    .insert(playlist)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
```

## Environment Variables

### Required Variables
```env
# Supabase (from starterpack)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback

# Optional: Apple Music API (future)
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY=your_private_key
```

## Performance Optimizations

### Caching Strategy
- **React Query** - Server state caching with smart invalidation
- **Next.js** - Static generation for public pages
- **Supabase** - Database connection pooling
- **CDN** - Image optimization via Vercel

### Real-time Features
- **Supabase Realtime** - Live playlist updates
- **Optimistic Updates** - Immediate UI feedback
- **Background Sync** - Periodic data synchronization

### SEO & Accessibility
- **Meta tags** - Dynamic SEO for playlist pages
- **Open Graph** - Social media sharing
- **ARIA labels** - Screen reader support
- **Keyboard navigation** - Full keyboard accessibility

## Security Considerations

### Data Protection
- **Row Level Security** - Database-level access control
- **Input validation** - Server-side validation for all inputs
- **Rate limiting** - API endpoint protection
- **CORS** - Proper cross-origin configuration

### Authentication Security
- **HTTP-only cookies** - Secure session storage
- **Token refresh** - Automatic token renewal
- **OAuth scopes** - Minimal required permissions
- **Session validation** - Server-side session checks

## Deployment Strategy

### Vercel Deployment
- **Automatic deployments** - Git-based deployments
- **Environment variables** - Secure configuration management
- **Edge functions** - Global performance optimization
- **Analytics** - Built-in performance monitoring

### Database Migrations
- **Supabase migrations** - Version-controlled schema changes
- **Seed data** - Initial data setup
- **Backup strategy** - Regular database backups