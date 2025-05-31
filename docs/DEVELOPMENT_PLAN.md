# 🚀 PlaylistShare Development Plan - Starterpack Foundation

## Project Overview

Building upon the **Supabase Next.js Starterpack** foundation, this plan outlines the systematic migration and enhancement of the existing playlist prototype into a production-ready application.

### Foundation Assets
- ✅ Next.js 14 with App Router
- ✅ Supabase authentication with cookie sessions
- ✅ shadcn/ui component library
- ✅ Tailwind CSS styling
- ✅ TypeScript configuration
- ✅ React Query setup

## Phase 1: Foundation Analysis & Setup (Days 1-2)

### 1.1 Documentation & Planning ✅
- [x] Create `STARTERPACK_FEATURES.md` documentation
- [x] Update `TECHNICAL_SPECS.md` for starterpack alignment
- [x] Update `DEVELOPMENT_PLAN.md` with new architecture
- [ ] Analyze existing starterpack components and patterns

### 1.2 Environment Setup
- [ ] Verify Supabase project connection
- [ ] Set up development environment variables
- [ ] Test existing authentication flow
- [ ] Document current component inventory

### 1.3 Old Code Analysis
- [ ] Audit playlist folder components for migration
- [ ] Identify reusable UI patterns
- [ ] Map component dependencies
- [ ] Plan component integration strategy

## Phase 2: Database Schema & Types (Days 3-4)

### 2.1 Database Schema Implementation
```sql
-- User profiles extension
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

-- Core playlist tables
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  platform varchar(20) CHECK (platform IN ('spotify', 'apple', 'custom')) NOT NULL,
  external_id varchar(255),
  external_url text,
  track_count integer DEFAULT 0,
  duration_ms bigint DEFAULT 0,
  cover_image_url text,
  is_public boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Social features
CREATE TABLE public.playlist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, playlist_id)
);

CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);
```

### 2.2 Row Level Security Policies
- [ ] Implement RLS policies for all tables
- [ ] Test security policies with different user roles
- [ ] Document security model

### 2.3 TypeScript Type Definitions
- [ ] Create `types/database.ts` with Supabase types
- [ ] Create `types/playlist.ts` for extended types
- [ ] Create `types/spotify.ts` for external API types
- [ ] Update existing types to include playlist features

## Phase 3: Component Architecture (Days 5-6)

### 3.1 Component Organization Strategy
```
components/
├── ui/                     # shadcn/ui (existing)
├── auth/                   # Extend existing auth
├── layout/                 # New layout components
├── playlists/              # Playlist-specific
├── users/                  # User management
├── social/                 # Social features
└── common/                 # Shared utilities
```

### 3.2 Core Component Migration
- [ ] Migrate `PlaylistCard` with shadcn/ui integration
- [ ] Migrate `UserProfile` extending existing patterns
- [ ] Create `PlaylistGrid` for listing views
- [ ] Create `LikeButton` with optimistic updates
- [ ] Create `FollowButton` with real-time updates

### 3.3 Layout Components
- [ ] Create `MainLayout` extending existing layout
- [ ] Create `Header` with navigation and user menu
- [ ] Create `Sidebar` for playlist navigation
- [ ] Create responsive design patterns

## Phase 4: State Management (Days 7-8)

### 4.1 React Query Setup
```typescript
// hooks/use-playlists.ts
export function usePlaylists(filters?: PlaylistFilters) {
  return useQuery({
    queryKey: ['playlists', filters],
    queryFn: () => fetchPlaylists(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaylistMutations() {
  const queryClient = useQueryClient();
  
  const likePlaylist = useMutation({
    mutationFn: togglePlaylistLike,
    onMutate: async (playlistId) => {
      // Optimistic update logic
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
  
  return { likePlaylist };
}
```

### 4.2 Context Providers
- [ ] Create `PlaylistProvider` for current playlist state
- [ ] Create `PlayerProvider` for playback state
- [ ] Integrate with existing auth context
- [ ] Implement optimistic UI updates

### 4.3 Custom Hooks
- [ ] `usePlaylists` - Fetch and cache playlists
- [ ] `usePlaylistMutations` - Create, update, delete
- [ ] `useUserProfile` - User data management
- [ ] `useSocialActions` - Likes and follows

## Phase 5: Supabase Integration (Days 9-10)

### 5.1 Database Operations
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
      user_profiles (id, username, avatar_url),
      playlist_likes (count),
      playlist_plays (count)
    `)
    .eq('is_public', true);
    
  // Apply filters
  if (filters?.tags?.length) {
    query = query.overlaps('tags', filters.tags);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
```

### 5.2 Real-time Features
- [ ] Set up real-time subscriptions for playlist updates
- [ ] Implement live like counts
- [ ] Add real-time activity feeds
- [ ] Handle connection state management

### 5.3 Authentication Extensions
- [ ] Extend signup flow with username selection
- [ ] Add profile completion checks
- [ ] Implement Spotify OAuth integration
- [ ] Create onboarding flow

## Phase 6: API Routes & External Integration (Days 11-12)

### 6.1 Next.js API Routes
```
app/api/
├── playlists/
│   ├── route.ts              # GET /api/playlists
│   ├── [id]/route.ts         # GET/PUT/DELETE /api/playlists/[id]
│   └── import/route.ts       # POST /api/playlists/import
├── users/
│   ├── [id]/route.ts         # GET /api/users/[id]
│   ├── profile/route.ts      # GET/PUT /api/users/profile
│   └── follow/route.ts       # POST/DELETE /api/users/follow
└── spotify/
    ├── auth/route.ts         # Spotify OAuth
    ├── playlists/route.ts    # Fetch Spotify playlists
    └── refresh/route.ts      # Token refresh
```

### 6.2 Spotify Integration
- [ ] Set up Spotify Developer App
- [ ] Implement OAuth 2.0 flow
- [ ] Create playlist import functionality
- [ ] Add token refresh mechanism
- [ ] Handle rate limiting

### 6.3 Error Handling & Validation
- [ ] Implement comprehensive error boundaries
- [ ] Add input validation with Zod
- [ ] Create user-friendly error messages
- [ ] Add retry mechanisms for failed requests

## Phase 7: Page Implementation (Days 13-14)

### 7.1 Core Pages
```
app/
├── page.tsx                  # Home/Discovery page
├── playlists/
│   ├── page.tsx             # Browse all playlists
│   ├── [id]/page.tsx        # Individual playlist view
│   └── create/page.tsx      # Create new playlist
├── profile/
│   ├── [username]/page.tsx  # User profile
│   └── settings/page.tsx    # Profile settings
├── dashboard/
│   └── page.tsx             # User dashboard
└── search/
    └── page.tsx             # Search results
```

### 7.2 Page Features
- [ ] Implement infinite scrolling for playlist feeds
- [ ] Add search functionality with filters
- [ ] Create responsive design for all screen sizes
- [ ] Add proper SEO meta tags and Open Graph

### 7.3 Navigation & Routing
- [ ] Implement breadcrumb navigation
- [ ] Add back/forward navigation support
- [ ] Create deep linking for playlists
- [ ] Add URL state management for filters

## Phase 8: UI/UX Polish (Days 15-16)

### 8.1 Enhanced UI Components
- [ ] Add loading skeletons using shadcn/ui
- [ ] Implement smooth animations with Framer Motion
- [ ] Create hover states and micro-interactions
- [ ] Add proper focus management for accessibility

### 8.2 Performance Optimization
- [ ] Implement image optimization for playlist covers
- [ ] Add code splitting for route-based chunks
- [ ] Optimize bundle size analysis
- [ ] Add performance monitoring

### 8.3 Responsive Design
- [ ] Mobile-first responsive implementation
- [ ] Tablet layout optimizations
- [ ] Desktop layout enhancements
- [ ] Touch gesture support for mobile

## Phase 9: Testing & Quality Assurance (Days 17-18)

### 9.1 Testing Strategy
```typescript
// __tests__/components/PlaylistCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaylistCard } from '@/components/playlists/playlist-card';

describe('PlaylistCard', () => {
  it('renders playlist information correctly', () => {
    // Test implementation
  });
  
  it('handles like button interaction', () => {
    // Test optimistic updates
  });
});
```

### 9.2 Test Coverage
- [ ] Unit tests for utility functions
- [ ] Component tests with React Testing Library
- [ ] Integration tests for API routes
- [ ] E2E tests for critical user flows

### 9.3 Performance Testing
- [ ] Lighthouse audits for all pages
- [ ] Bundle size analysis
- [ ] Database query optimization
- [ ] Load testing for concurrent users

## Phase 10: Deployment & Monitoring (Days 19-20)

### 10.1 Production Deployment
- [ ] Configure Vercel deployment settings
- [ ] Set up environment variables in production
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificates

### 10.2 Monitoring & Analytics
- [ ] Set up error tracking with Sentry
- [ ] Implement user analytics
- [ ] Add performance monitoring
- [ ] Create health check endpoints

### 10.3 Documentation & Maintenance
- [ ] Create user documentation
- [ ] Document API endpoints
- [ ] Set up automated backups
- [ ] Create maintenance procedures

## Technical Milestones

### Week 1 (Days 1-7)
- ✅ Documentation complete
- [ ] Database schema implemented
- [ ] Core components migrated
- [ ] Basic state management working

### Week 2 (Days 8-14)
- [ ] Supabase integration complete
- [ ] API routes implemented
- [ ] All pages functional
- [ ] Spotify integration working

### Week 3 (Days 15-21)
- [ ] UI/UX polished
- [ ] Testing complete
- [ ] Production deployment
- [ ] Monitoring active

## Success Metrics

### Technical Metrics
- [ ] Page load time < 2 seconds
- [ ] Lighthouse score > 90
- [ ] Test coverage > 80%
- [ ] Zero critical security vulnerabilities

### User Experience Metrics
- [ ] Responsive design on all devices
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Smooth animations and interactions
- [ ] Intuitive navigation flow

### Feature Completeness
- [ ] User authentication and profiles
- [ ] Playlist creation and management
- [ ] Social features (likes, follows)
- [ ] Spotify integration
- [ ] Search and discovery
- [ ] Real-time updates

## Risk Mitigation

### Technical Risks
- **Database performance**: Implement proper indexing and query optimization
- **API rate limits**: Add caching and request queuing
- **Real-time scaling**: Use Supabase's built-in scaling features

### User Experience Risks
- **Complex onboarding**: Create guided tutorial flow
- **Mobile performance**: Prioritize mobile optimization
- **Accessibility**: Regular accessibility audits

### External Dependencies
- **Spotify API changes**: Monitor API documentation and implement fallbacks
- **Supabase service**: Have backup plans for critical features
- **Vercel deployment**: Understand platform limitations and alternatives

This development plan provides a systematic approach to migrating and enhancing the playlist application while building upon the solid foundation of the Supabase Next.js starterpack. 