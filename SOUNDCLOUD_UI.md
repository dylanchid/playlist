# SoundCloud-Inspired UI Components

This project includes a complete set of SoundCloud-inspired UI components built with React, TypeScript, and Tailwind CSS. The components are designed to replicate the dark, modern aesthetic of SoundCloud with orange accent colors and smooth interactions.

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#ff5500` (SoundCloud's signature color)
- **Dark Background**: `#0f1419` (Deep dark)
- **Secondary Background**: `#111827` (Main dark)
- **Surface**: `#1f2937` (Card backgrounds)
- **Text**: White/Gray variants for dark theme

### Typography
- Clean, modern sans-serif fonts
- Hierarchical text sizes with proper contrast
- Monospace for time displays

## 🧩 Components

### 1. SoundCloudHeader
**Location**: `components/common/soundcloud-header.tsx`

A sticky navigation header with search, user menu, and navigation links.

```tsx
<SoundCloudHeader
  user={user}
  onSearch={(query) => console.log('Search:', query)}
  onUpload={() => console.log('Upload clicked')}
  onNotifications={() => console.log('Notifications clicked')}
  onMessages={() => console.log('Messages clicked')}
  onLogout={() => console.log('Logout clicked')}
/>
```

**Features**:
- Responsive design with mobile menu
- Search bar with autocomplete styling
- User avatar dropdown menu
- Upload button with prominent styling
- Notification indicators

### 2. SoundCloudProfileHeader
**Location**: `components/users/soundcloud-profile-header.tsx`

A hero section for user profiles with banner image, avatar overlay, and stats.

```tsx
<SoundCloudProfileHeader
  user={user}
  stats={{ followers: 1234, following: 567, tracks: 89, playlists: 12 }}
  isOwnProfile={true}
  onFollow={() => console.log('Follow clicked')}
  onMessage={() => console.log('Message clicked')}
/>
```

**Features**:
- Large banner image with overlay
- Circular avatar positioned over banner
- User stats display
- Follow/Message buttons
- Connected platform badges
- Responsive layout

### 3. SoundCloudProfileNav
**Location**: `components/users/soundcloud-profile-nav.tsx`

Horizontal tab navigation for profile content sections.

```tsx
<SoundCloudProfileNav
  defaultTab="tracks"
  trackCount={15}
  playlistCount={5}
  albumCount={2}
  repostCount={8}
>
  <TabsContent value="tracks">
    {/* Track content */}
  </TabsContent>
</SoundCloudProfileNav>
```

**Features**:
- Horizontal tabs with active state
- Badge counts for each section
- Orange accent for active tab
- Smooth transitions

### 4. SoundCloudTrackCard
**Location**: `components/playlists/soundcloud-track-card.tsx`

Individual track display with waveform visualization and social actions.

```tsx
<SoundCloudTrackCard
  track={track}
  isPlaying={currentTrack?.id === track.id && isPlaying}
  onPlay={() => handlePlay(track)}
  onLike={() => console.log('Like track:', track.id)}
  onShare={() => console.log('Share track:', track.id)}
  onRepost={() => console.log('Repost track:', track.id)}
/>
```

**Features**:
- Animated waveform visualization
- Play/pause button with state
- Social actions (like, repost, comment, share)
- User avatar and track metadata
- Hover effects and animations
- Tag support

### 5. SoundCloudPlayer
**Location**: `components/common/soundcloud-player.tsx`

Bottom audio player with full controls and progress tracking.

```tsx
<SoundCloudPlayer
  currentTrack={currentTrack}
  isPlaying={isPlaying}
  currentTime={currentTime}
  volume={75}
  isLiked={false}
  isShuffled={false}
  repeatMode="off"
  onPlay={handlePlayerPlay}
  onPause={handlePlayerPause}
  onNext={() => console.log('Next track')}
  onPrevious={() => console.log('Previous track')}
  onSeek={handleSeek}
  onVolumeChange={(volume) => console.log('Volume:', volume)}
  // ... other handlers
/>
```

**Features**:
- Clickable progress bar
- Volume control with slider
- Shuffle and repeat modes
- Track information display
- Social actions integration
- Full-screen mode toggle

### 6. SoundCloudLayout
**Location**: `components/layout/soundcloud-layout.tsx`

A complete layout wrapper with player context management.

```tsx
<SoundCloudLayout
  user={user}
  onSearch={(query) => handleSearch(query)}
  onUpload={() => handleUpload()}
>
  {/* Your page content */}
</SoundCloudLayout>
```

**Features**:
- Global player state management
- Context provider for player controls
- Automatic spacing for bottom player
- Optional header/player hiding

## 🎵 Player Context

The `usePlayer` hook provides global player state:

```tsx
import { usePlayer } from '@/components/layout/soundcloud-layout'

function TrackComponent() {
  const { 
    currentTrack, 
    isPlaying, 
    setCurrentTrack, 
    setIsPlaying 
  } = usePlayer()
  
  const handlePlay = () => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }
  
  return (
    <button onClick={handlePlay}>
      Play Track
    </button>
  )
}
```

## 🌙 Dark Theme

All components are designed for dark mode with:
- Dark gray backgrounds (`bg-soundcloud-gray-900`, `bg-soundcloud-gray-950`)
- White text with appropriate contrast
- Orange accents for interactive elements
- Subtle hover effects and transitions

## 📱 Responsive Design

All components include:
- Mobile-first responsive design
- Touch-friendly interactive elements
- Collapsible navigation for mobile
- Adaptive layouts for different screen sizes

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install @radix-ui/react-tabs @radix-ui/react-dropdown-menu
   ```

2. **Use the Layout**:
   ```tsx
   import { SoundCloudLayout } from '@/components/layout/soundcloud-layout'
   
   export default function Page() {
     return (
       <SoundCloudLayout user={user}>
         <div>Your content here</div>
       </SoundCloudLayout>
     )
   }
   ```

3. **Add Track Cards**:
   ```tsx
   import { SoundCloudTrackCard } from '@/components/playlists/soundcloud-track-card'
   import { usePlayer } from '@/components/layout/soundcloud-layout'
   
   function TrackList({ tracks }) {
     const { setCurrentTrack, setIsPlaying } = usePlayer()
     
     return (
       <div className="space-y-0">
         {tracks.map(track => (
           <SoundCloudTrackCard
             key={track.id}
             track={track}
             onPlay={() => {
               setCurrentTrack(track)
               setIsPlaying(true)
             }}
           />
         ))}
       </div>
     )
   }
   ```

## 🎨 Customization

### Colors
Update the SoundCloud color palette in `tailwind.config.ts`:

```typescript
soundcloud: {
  orange: {
    500: '#ff5500', // Main orange
    600: '#ea580c', // Darker orange
  },
  gray: {
    900: '#111827', // Main dark
    950: '#0f1419', // Deeper dark
  },
}
```

### Animations
Custom animations are available:
- `animate-waveform`: For waveform bars
- `animate-pulse-orange`: For loading states

## 📋 Demo

Visit `/soundcloud-demo` to see all components in action with mock data.

## 🎯 Integration with Existing App

These components can be gradually integrated into your existing playlist application:

1. Start with the layout wrapper
2. Replace existing cards with SoundCloud-style versions
3. Integrate the global player context
4. Update your color scheme to match

The components are designed to be modular and can work alongside your existing UI components. 