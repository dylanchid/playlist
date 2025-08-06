# Spotify Web API Integration - Implementation Plan

## Overview
This document outlines the comprehensive plan to integrate Spotify Web API into our Next.js playlist application. The integration will enable users to connect their Spotify accounts, import playlists, and sync their music libraries.

## Current State Analysis

### ✅ What's Already Implemented
- **TypeScript Types**: Complete Spotify API types in `types/spotify.ts` with comprehensive interface definitions
- **Database Schema**: User spotify fields (`spotify_id`, `spotify_access_token`, `spotify_refresh_token`, `spotify_token_expires_at`)
- **UI Components**: Platform-aware components with Spotify branding using Radix UI primitives
- **Mock Data**: Spotify platform references throughout the app
- **Infrastructure**: TanStack Query for state management, Zustand stores, Supabase client singleton pattern
- **Form Handling**: React Hook Form with Zod validation schemas ready for Spotify auth flows

### 🚧 What's Missing
- **OAuth 2.0 Flow**: Authorization code with PKCE (leverage existing Supabase auth patterns)
- **API Client**: Spotify Web API wrapper with TanStack Query integration
- **Import Logic**: Playlist/track conversion and storage using existing database patterns
- **Token Management**: Refresh and validation with Supabase RLS integration
- **API Routes**: Server-side Spotify endpoints following existing API structure
- **Error Handling**: Rate limiting and API errors with existing toast system (Sonner)

## Implementation Phases

## Phase 1: Core Infrastructure (Week 1)

### 1.1 Environment Configuration
- [ ] Set up Spotify App in Spotify Developer Dashboard
- [ ] Configure OAuth redirect URIs
- [ ] Add environment variables to `.env.local`

### 1.2 API Client Foundation
**Priority: HIGH**
```typescript
// lib/spotify/client.ts - Modern singleton pattern with TanStack Query integration
export class SpotifyAPIClient {
  private static instance: SpotifyAPIClient | null = null;
  private accessToken: string;
  private refreshToken?: string;
  private expiresAt?: Date;
  private rateLimiter: SpotifyRateLimiter;
  
  static getInstance(config?: SpotifyTokens): SpotifyAPIClient {
    if (!SpotifyAPIClient.instance) {
      SpotifyAPIClient.instance = new SpotifyAPIClient(config);
    }
    return SpotifyAPIClient.instance;
  }
  
  async getUserProfile(): Promise<SpotifyUser>
  async getUserPlaylists(limit?: number, offset?: number): Promise<SpotifyPlaylistsResponse>
  async getPlaylist(playlistId: string, fields?: string): Promise<SpotifyPlaylist>
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTracksResponse>
  async refreshAccessToken(): Promise<void>
  
  // TanStack Query integration helpers
  createQueryKey(endpoint: string, params?: Record<string, any>): string[]
  getCachedData<T>(queryKey: string[]): T | undefined
}

// lib/spotify/queries.ts - TanStack Query hooks
export const useSpotifyUser = () => useQuery({
  queryKey: ['spotify', 'user'],
  queryFn: () => SpotifyAPIClient.getInstance().getUserProfile(),
  staleTime: 1000 * 60 * 15, // 15 minutes
});

export const useSpotifyPlaylists = (limit = 50) => useInfiniteQuery({
  queryKey: ['spotify', 'playlists', limit],
  queryFn: ({ pageParam = 0 }) => 
    SpotifyAPIClient.getInstance().getUserPlaylists(limit, pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.next ? lastPage.offset + lastPage.limit : undefined,
});
```

### 1.3 OAuth 2.0 Implementation
**Priority: HIGH**
```typescript
// lib/spotify/auth.ts
export class SpotifyAuth {
  static generateAuthURL(state: string, codeVerifier: string): string
  static exchangeCodeForTokens(code: string, codeVerifier: string): Promise<SpotifyTokenResponse>
  static refreshToken(refreshToken: string): Promise<SpotifyTokenRefreshResponse>
}
```

### 1.4 Database Integration
**Priority: MEDIUM**
```typescript
// lib/spotify/database.ts - Leverage existing Supabase patterns
import { createClient } from '@/lib/supabase/client';
import type { SpotifyTokenResponse, SpotifyTokens } from '@/types/spotify';

export async function saveSpotifyTokens(userId: string, tokens: SpotifyTokenResponse): Promise<void> {
  const supabase = createClient();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  
  const { error } = await supabase
    .from('users')
    .update({
      spotify_access_token: tokens.access_token,
      spotify_refresh_token: tokens.refresh_token,
      spotify_token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw new Error(`Failed to save Spotify tokens: ${error.message}`);
}

export async function getSpotifyTokens(userId: string): Promise<SpotifyTokens | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
    .eq('id', userId)
    .single();
    
  if (error || !data?.spotify_access_token) return null;
  
  return {
    accessToken: data.spotify_access_token,
    refreshToken: data.spotify_refresh_token,
    expiresAt: data.spotify_token_expires_at ? new Date(data.spotify_token_expires_at) : undefined,
  };
}

export async function updateSpotifyTokens(userId: string, tokens: Partial<SpotifyTokens>): Promise<void> {
  const supabase = createClient();
  
  const updateData: any = {};
  if (tokens.accessToken) updateData.spotify_access_token = tokens.accessToken;
  if (tokens.refreshToken) updateData.spotify_refresh_token = tokens.refreshToken;
  if (tokens.expiresAt) updateData.spotify_token_expires_at = tokens.expiresAt.toISOString();
  
  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);
    
  if (error) throw new Error(`Failed to update Spotify tokens: ${error.message}`);
}

export async function removeSpotifyConnection(userId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('users')
    .update({
      spotify_id: null,
      spotify_access_token: null,
      spotify_refresh_token: null,
      spotify_token_expires_at: null,
    })
    .eq('id', userId);
    
  if (error) throw new Error(`Failed to remove Spotify connection: ${error.message}`);
}

// Additional helper for checking token validity
export async function isSpotifyTokenValid(userId: string): Promise<boolean> {
  const tokens = await getSpotifyTokens(userId);
  if (!tokens?.accessToken) return false;
  
  if (tokens.expiresAt && tokens.expiresAt <= new Date()) {
    return false; // Token expired
  }
  
  return true;
}
```

## Phase 2: Authentication Flow (Week 2)

### 2.1 API Routes
**Files to Create:**
```
app/api/spotify/
├── auth/
│   ├── login/route.ts          # Initialize OAuth flow
│   └── callback/route.ts       # Handle OAuth callback
├── token/
│   ├── refresh/route.ts        # Refresh access token
│   └── revoke/route.ts         # Disconnect Spotify
└── user/route.ts               # Get current user info
```

### 2.2 Auth Flow Implementation
```typescript
// app/api/spotify/auth/login/route.ts
export async function GET(request: NextRequest) {
  // 1. Generate state and code_verifier
  // 2. Store in secure session
  // 3. Redirect to Spotify authorization URL
}

// app/api/spotify/auth/callback/route.ts
export async function GET(request: NextRequest) {
  // 1. Validate state parameter
  // 2. Exchange code for tokens
  // 3. Save tokens to database
  // 4. Redirect to success page
}
```

### 2.3 Frontend Components
```typescript
// components/spotify/connect-button.tsx - Modern React patterns with existing UI components
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface SpotifyConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

export function SpotifyConnectButton({ 
  onSuccess, 
  onError, 
  variant = 'default',
  size = 'default' 
}: SpotifyConnectButtonProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/spotify/auth/login');
      if (!response.ok) throw new Error('Failed to initiate Spotify connection');
      const data = await response.json();
      return data.authUrl;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: error.message,
      });
      onError?.(error.message);
    }
  });

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => connectMutation.mutate()}
      disabled={connectMutation.isPending}
      className="flex items-center gap-2"
    >
      <SpotifyIcon className="w-4 h-4" />
      {connectMutation.isPending ? 'Connecting...' : 'Connect Spotify'}
    </Button>
  );
}

// components/spotify/disconnect-button.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SpotifyDisconnectButtonProps {
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'destructive';
}

export function SpotifyDisconnectButton({ onSuccess, variant = 'outline' }: SpotifyDisconnectButtonProps) {
  const { toast } = useToast();
  
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/spotify/auth/disconnect', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to disconnect Spotify');
    },
    onSuccess: () => {
      toast({
        title: 'Spotify disconnected',
        description: 'Your Spotify account has been disconnected successfully.',
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Disconnection failed',
        description: error.message,
      });
    }
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size="sm">
          Disconnect Spotify
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect Spotify Account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove your Spotify connection and stop syncing your playlists. 
            Your imported playlists will remain but won't be updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
            className="bg-destructive text-destructive-foreground"
          >
            {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// components/spotify/status-indicator.tsx - New component for connection status
export function SpotifyStatusIndicator({ isConnected, lastSync }: { isConnected: boolean; lastSync?: Date }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span>
        {isConnected ? 'Connected' : 'Not connected'}
        {lastSync && isConnected && (
          <span className="ml-2">
            Last sync: {formatDistanceToNow(lastSync, { addSuffix: true })}
          </span>
        )}
      </span>
    </div>
  );
}
```

## Phase 3: Data Import & Sync (Week 3)

### 3.1 Playlist Import API Routes
```
app/api/spotify/
├── playlists/
│   ├── route.ts                # List user playlists
│   ├── [id]/route.ts          # Get specific playlist
│   └── import/route.ts        # Import playlist to our DB
└── import/
    ├── bulk/route.ts          # Bulk import multiple playlists
    └── status/[jobId]/route.ts # Check import status
```

### 3.2 Import Logic Implementation
```typescript
// lib/spotify/import.ts
export class SpotifyImporter {
  async importPlaylist(
    spotifyPlaylistId: string, 
    userId: string, 
    options: ImportOptions
  ): Promise<string> // Returns our playlist ID
  
  async importUserPlaylists(
    userId: string, 
    filters: PlaylistFilters
  ): Promise<ImportJob>
  
  async convertSpotifyPlaylist(
    spotifyPlaylist: SpotifyPlaylist
  ): Promise<ConvertedPlaylist>
  
  async convertSpotifyTracks(
    spotifyTracks: SpotifyPlaylistTrack[]
  ): Promise<ConvertedTrack[]>
}
```

### 3.3 Background Jobs (Optional)
```typescript
// lib/spotify/jobs.ts
export class ImportJobManager {
  async createImportJob(userId: string, playlistIds: string[]): Promise<string>
  async processImportJob(jobId: string): Promise<void>
  async getJobStatus(jobId: string): Promise<ImportJobStatus>
}
```

## Phase 4: UI Integration (Week 4)

### 4.1 User Profile Integration
```typescript
// components/profile/spotify-section.tsx
export function SpotifyProfileSection({ user }: { user: UserWithStats }) {
  // Display Spotify connection status
  // Show connected playlists count
  // Import/sync controls
}
```

### 4.2 Playlist Management
```typescript
// components/playlists/spotify-import-modal.tsx
export function SpotifyImportModal({ isOpen, onClose }: Props) {
  // List user's Spotify playlists
  // Select playlists to import
  // Configure import settings
}

// components/playlists/import-progress.tsx
export function ImportProgress({ jobId }: { jobId: string }) {
  // Real-time import progress
  // Error handling and retry
}
```

### 4.3 Enhanced Playlist Cards
```typescript
// Update existing components/playlists/playlist-card.tsx
// Add Spotify-specific features:
// - Link to original Spotify playlist
// - Sync status indicator
// - Last sync timestamp
```

## Phase 5: Advanced Features (Week 5-6)

### 5.1 Sync & Updates
```typescript
// lib/spotify/sync.ts
export class SpotifySync {
  async syncPlaylist(playlistId: string): Promise<SyncResult>
  async syncUserPlaylists(userId: string): Promise<SyncSummary>
  async detectPlaylistChanges(playlistId: string): Promise<PlaylistChanges>
}
```

### 5.2 Search Integration
```typescript
// app/api/spotify/search/route.ts
export async function GET(request: NextRequest) {
  // Search Spotify catalog
  // Return unified search results
}
```

### 5.3 Playback Integration (Future)
```typescript
// lib/spotify/playback.ts (Web Playback SDK)
export class SpotifyPlayer {
  async initializePlayer(): Promise<void>
  async play(trackUri: string): Promise<void>
  async pause(): Promise<void>
  async getCurrentTrack(): Promise<SpotifyTrack>
}
```

## Technical Implementation Details

### Authentication & Security

#### OAuth 2.0 with PKCE Flow
```typescript
// 1. Generate authorization URL
const authUrl = new URL('https://accounts.spotify.com/authorize');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('scope', scopes.join(' '));

// 2. Exchange code for tokens
const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  })
});
```

#### Required Scopes
```typescript
const REQUIRED_SCOPES = [
  'user-read-private',           // Basic profile info
  'user-read-email',            // Email address
  'playlist-read-private',      // Private playlists
  'playlist-read-collaborative', // Collaborative playlists
  'user-library-read',          // Saved tracks/albums
];

const OPTIONAL_SCOPES = [
  'streaming',                  // Web Playback SDK
  'user-read-playback-state',   // Current playback
  'user-modify-playback-state', // Control playback
];
```

### Error Handling & Rate Limiting

#### Spotify API Rate Limits
- **General requests**: 100 requests per minute
- **Search requests**: 100 requests per minute
- **Token requests**: 100 requests per minute

#### Implementation Strategy
```typescript
// lib/spotify/rate-limiter.ts
export class SpotifyRateLimiter {
  private requestQueue: Map<string, number[]> = new Map();
  
  async throttleRequest(endpoint: string): Promise<void> {
    // Implement sliding window rate limiting
  }
  
  handleRateLimitError(response: Response): Promise<void> {
    // Handle 429 responses with Retry-After header
  }
}
```

#### Error Handling
```typescript
// lib/spotify/errors.ts
export class SpotifyAPIError extends Error {
  constructor(
    public status: number,
    public spotifyError: SpotifyError,
    message?: string
  ) {
    super(message || spotifyError.error.message);
  }
}

export function handleSpotifyError(response: Response): never {
  switch (response.status) {
    case 401: throw new SpotifyAPIError(401, 'Token expired or invalid');
    case 403: throw new SpotifyAPIError(403, 'Forbidden - insufficient scope');
    case 429: throw new SpotifyAPIError(429, 'Rate limit exceeded');
    case 404: throw new SpotifyAPIError(404, 'Resource not found');
    default: throw new SpotifyAPIError(response.status, 'Unknown error');
  }
}
```

### Data Conversion & Storage

#### Playlist Conversion
```typescript
function convertSpotifyPlaylist(
  spotifyPlaylist: SpotifyPlaylist,
  userId: string
): CreatePlaylistData {
  return {
    name: spotifyPlaylist.name,
    description: spotifyPlaylist.description || '',
    platform: 'spotify',
    external_id: spotifyPlaylist.id,
    external_url: spotifyPlaylist.external_urls.spotify,
    track_count: spotifyPlaylist.tracks.total,
    duration_ms: 0, // Calculate from tracks
    cover_image_url: spotifyPlaylist.images[0]?.url,
    is_public: spotifyPlaylist.public,
    user_id: userId,
    tags: [], // User-defined during import
    spotify_snapshot_id: spotifyPlaylist.snapshot_id,
  };
}
```

#### Track Conversion
```typescript
function convertSpotifyTrack(
  spotifyTrack: SpotifyPlaylistTrack,
  playlistId: string,
  position: number
): CreateTrackData {
  const track = spotifyTrack.track;
  return {
    track_name: track.name,
    artist_name: track.artists.map(a => a.name).join(', '),
    album_name: track.album.name,
    duration_ms: track.duration_ms,
    external_id: track.id,
    track_url: track.external_urls.spotify,
    preview_url: track.preview_url,
    playlist_id: playlistId,
    position: position,
    added_at: spotifyTrack.added_at,
  };
}
```

## Database Schema Updates

### User Table Extensions
```sql
-- Already exists in current schema
ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_token_expires_at TIMESTAMP;
```

### Playlist Table Extensions
```sql
-- Add Spotify-specific metadata
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS spotify_snapshot_id VARCHAR(255);
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false;
```

### Import Jobs Table (Optional)
```sql
CREATE TABLE IF NOT EXISTS spotify_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  playlist_ids TEXT[], -- Spotify playlist IDs to import
  imported_count INTEGER DEFAULT 0,
  total_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

### Required Environment Variables
```bash
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/auth/callback

# Production URLs
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://yourapp.com/api/spotify/auth/callback

# Security
SPOTIFY_STATE_SECRET=your_secure_random_string_for_state_generation
NEXTAUTH_SECRET=your_nextauth_secret # If using NextAuth.js integration

# Redis (Optional - for production caching and rate limiting)
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=your_redis_token # For Upstash Redis

# Error Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
```

### Environment Setup Checklist
- [ ] Add to `.env.local` for development
- [ ] Add to production environment (Vercel/Railway/etc.)
- [ ] Configure Spotify app redirect URIs for all environments
- [ ] Set up error monitoring and logging
- [ ] Configure Redis for production caching (optional but recommended)

## Testing Strategy

### Unit Tests
- [ ] Spotify API client methods
- [ ] OAuth flow functions
- [ ] Data conversion utilities
- [ ] Error handling scenarios

### Integration Tests
- [ ] Complete OAuth flow
- [ ] Playlist import process
- [ ] Token refresh mechanism
- [ ] Database operations

### E2E Tests
- [ ] User connects Spotify account
- [ ] User imports playlists
- [ ] User disconnects account
- [ ] Sync functionality

## Security Considerations

### Token Security
- Store refresh tokens encrypted in database
- Use secure HTTP-only cookies for session management
- Implement token rotation on refresh
- Clear tokens on user logout/disconnect

### PKCE Implementation
- Generate cryptographically secure code verifier
- Use SHA256 for code challenge
- Validate state parameter to prevent CSRF

### Rate Limiting
- Implement user-based rate limiting
- Cache responses where appropriate
- Handle 429 responses gracefully

## Performance Optimization

### Caching Strategy with TanStack Query
```typescript
// lib/spotify/cache-config.ts
export const SPOTIFY_CACHE_CONFIG = {
  user: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes (was cacheTime)
  },
  playlists: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
  },
  tracks: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 120,   // 2 hours
  },
} as const;

// Optimistic updates for better UX
export const useOptimisticSpotifyImport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: importSpotifyPlaylist,
    onMutate: async (playlistData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['playlists'] });
      
      // Snapshot previous value
      const previousPlaylists = queryClient.getQueryData(['playlists']);
      
      // Optimistically update
      queryClient.setQueryData(['playlists'], (old: any) => ({
        ...old,
        items: [...(old?.items || []), { ...playlistData, status: 'importing' }],
      }));
      
      return { previousPlaylists };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};
```

### Background Processing with Job Queue
```typescript
// lib/spotify/job-queue.ts - Modern job processing
import { create } from 'zustand';

interface JobState {
  jobs: Map<string, ImportJob>;
  addJob: (job: ImportJob) => void;
  updateJob: (id: string, update: Partial<ImportJob>) => void;
  removeJob: (id: string) => void;
}

export const useJobQueue = create<JobState>((set, get) => ({
  jobs: new Map(),
  addJob: (job) => set((state) => {
    const newJobs = new Map(state.jobs);
    newJobs.set(job.id, job);
    return { jobs: newJobs };
  }),
  updateJob: (id, update) => set((state) => {
    const newJobs = new Map(state.jobs);
    const existing = newJobs.get(id);
    if (existing) {
      newJobs.set(id, { ...existing, ...update });
    }
    return { jobs: newJobs };
  }),
  removeJob: (id) => set((state) => {
    const newJobs = new Map(state.jobs);
    newJobs.delete(id);
    return { jobs: newJobs };
  }),
}));

// Background processing with Web Workers (for large imports)
export class SpotifyImportWorker {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker('/workers/spotify-import.js');
  }
  
  async processLargePlaylist(playlistData: SpotifyPlaylist): Promise<void> {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({ type: 'IMPORT_PLAYLIST', data: playlistData });
      
      this.worker.onmessage = (event) => {
        const { type, data, error } = event.data;
        
        if (type === 'IMPORT_COMPLETE') {
          resolve(data);
        } else if (type === 'IMPORT_ERROR') {
          reject(new Error(error));
        }
      };
    });
  }
}
```

### Rate Limiting with Modern Patterns
```typescript
// lib/spotify/rate-limiter.ts - Advanced rate limiting
export class SpotifyRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limits = {
    general: { requests: 100, window: 60000 }, // 100 req/min
    search: { requests: 100, window: 60000 },
    token: { requests: 100, window: 60000 },
  };
  
  async waitForSlot(endpoint: string): Promise<void> {
    const now = Date.now();
    const category = this.getCategoryForEndpoint(endpoint);
    const limit = this.limits[category];
    
    const requests = this.requests.get(category) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < limit.window);
    
    if (validRequests.length >= limit.requests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = limit.window - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot(endpoint); // Recursive check
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(category, validRequests);
  }
  
  private getCategoryForEndpoint(endpoint: string): keyof typeof this.limits {
    if (endpoint.includes('/search')) return 'search';
    if (endpoint.includes('/token')) return 'token';
    return 'general';
  }
}
```

## Monitoring & Analytics

### Metrics to Track
- OAuth conversion rate
- Import success/failure rates
- API response times
- Rate limit hits
- User engagement with Spotify features

### Logging
- OAuth flow events
- API errors and retries
- Import job progress
- Performance metrics

## Timeline & Milestones

### Week 1: Foundation
- ✅ Environment setup
- ✅ Basic API client
- ✅ OAuth flow implementation

### Week 2: Authentication
- ✅ Complete auth routes
- ✅ Frontend auth components
- ✅ Token management

### Week 3: Import System
- ✅ Playlist import logic
- ✅ Data conversion
- ✅ Database operations

### Week 4: UI Integration
- ✅ Profile integration
- ✅ Import modals
- ✅ Progress tracking

### Week 5-6: Polish
- ✅ Sync functionality
- ✅ Error handling
- ✅ Performance optimization

## Success Criteria

### Phase 1 Success
- [ ] Users can connect Spotify accounts
- [ ] OAuth flow works reliably
- [ ] Tokens are stored securely

### Phase 2 Success
- [ ] Users can import playlists
- [ ] Import preserves all metadata
- [ ] Large playlists import without errors

### Phase 3 Success
- [ ] Sync keeps playlists updated
- [ ] Performance is acceptable
- [ ] Error handling is robust

## Risk Mitigation

### Technical Risks
- **Rate limiting**: Implement proper throttling and queuing
- **Token expiration**: Automatic refresh with fallback
- **Large playlists**: Chunked processing and progress tracking
- **API changes**: Version pinning and monitoring

### Business Risks
- **User adoption**: Clear onboarding and value proposition
- **Data privacy**: Transparent data usage and deletion
- **Spotify policy**: Compliance with developer terms

## Future Enhancements

### Phase 2 Features
- Real-time playlist sync via webhooks
- Collaborative playlist features
- Advanced search and filtering
- Spotify Web Playback SDK integration

### Phase 3 Features
- Playlist recommendation engine
- Cross-platform playlist conversion
- Social features integration
- Analytics dashboard

---

## 🚀 Key Improvements in This Updated Plan

### Modern Architecture Integration
- **TanStack Query Integration**: Complete integration with your existing `@tanstack/react-query` setup for optimal caching and state management
- **Singleton Patterns**: Leveraging your existing Supabase client patterns for consistent architecture
- **Component Library Integration**: Full integration with your existing Radix UI components and design system

### Enhanced User Experience
- **Optimistic Updates**: Immediate UI feedback during import operations
- **Modern Loading States**: Integration with your existing toast system (Sonner)
- **Alert Dialogs**: Proper confirmation flows for destructive actions
- **Status Indicators**: Real-time connection and sync status display

### Production-Ready Features
- **Advanced Rate Limiting**: Sliding window algorithm with proper endpoint categorization
- **Job Queue Management**: Zustand-based job state management for background operations
- **Web Workers**: Support for processing large playlists without blocking the UI
- **Comprehensive Error Handling**: Integration with your existing error handling patterns

### Security & Performance
- **Enhanced Environment Configuration**: Complete security setup including state secrets
- **Redis Integration**: Optional but recommended for production caching
- **Token Validation**: Automatic token refresh and expiration handling
- **RLS Integration**: Proper integration with Supabase Row Level Security

### Developer Experience
- **TypeScript First**: Full type safety with your existing type definitions
- **Testing Strategy**: Comprehensive unit, integration, and E2E testing approach
- **Environment Checklists**: Clear setup procedures for all environments
- **Modern Hooks**: Custom hooks following React best practices

## Next Steps (Updated Priority Order)

### Phase 1: Foundation (Week 1)
1. **Environment Setup**: Configure Spotify Developer Dashboard and environment variables
2. **Core API Client**: Implement singleton SpotifyAPIClient with rate limiting
3. **Database Functions**: Create Supabase integration functions
4. **TanStack Query Setup**: Configure query hooks and cache settings

### Phase 2: Authentication (Week 2)
1. **OAuth Routes**: Implement PKCE flow with proper state management
2. **UI Components**: Build connect/disconnect buttons with your design system
3. **Token Management**: Automatic refresh and validation logic
4. **Status Components**: Connection indicators and sync status

### Phase 3: Import System (Week 3)
1. **Import Logic**: Playlist/track conversion with optimistic updates
2. **Job Queue**: Background processing for large playlists
3. **Progress Tracking**: Real-time import status with toast notifications
4. **Error Recovery**: Retry mechanisms and error boundaries

### Phase 4: Enhancement (Week 4)
1. **Advanced Features**: Sync functionality and playlist updates
2. **Performance Optimization**: Web Workers for heavy processing
3. **Analytics Integration**: Track user engagement and import success rates
4. **Testing & QA**: Comprehensive testing across all flows

## Resources & Documentation

### Spotify API References
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Playlist Endpoints](https://developer.spotify.com/documentation/web-api/reference/get-playlist)
- [Rate Limiting](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)

### Your Tech Stack Integration
- [TanStack Query v5 Guide](https://tanstack.com/query/latest)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Radix UI Components](https://www.radix-ui.com/primitives)

### Performance & Security
- [Web Workers for Heavy Computations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [OAuth 2.0 PKCE Flow](https://oauth.net/2/pkce/)
- [Rate Limiting Strategies](https://blog.logrocket.com/rate-limiting-node-js/)
- [Optimistic Updates Pattern](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) 