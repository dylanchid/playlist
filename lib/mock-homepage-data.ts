// Mock data for homepage sections

export interface PlaylistData {
  id: string
  name: string
  description: string
  coverUrl: string
  user: {
    username: string
    avatar_url: string
  }
  trackCount: number
  likes: number
  genre: string
  platform: string
  duration?: string
}

export const mockTrendingPlaylists: PlaylistData[] = [
  {
    id: 't1',
    name: 'Viral Hits 2024',
    description: 'The biggest songs taking over social media',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    user: {
      username: 'trendspotter',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    },
    trackCount: 25,
    likes: 12453,
    genre: 'Pop',
    platform: 'Spotify',
    duration: '1h 32m'
  },
  {
    id: 't2',
    name: 'Underground Hip-Hop',
    description: 'Fresh beats from upcoming artists',
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    user: {
      username: 'hiphop_head',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    trackCount: 42,
    likes: 8901,
    genre: 'Hip-Hop',
    platform: 'Apple Music',
    duration: '2h 18m'
  },
  {
    id: 't3',
    name: 'Electronic Euphoria',
    description: 'High-energy electronic dance music',
    coverUrl: 'https://images.unsplash.com/photo-1518972734183-c78f6c0b5b23?w=400&h=400&fit=crop',
    user: {
      username: 'edm_lover',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'
    },
    trackCount: 36,
    likes: 7654,
    genre: 'Electronic',
    platform: 'Spotify',
    duration: '2h 5m'
  },
  {
    id: 't4',
    name: 'Indie Folk Revival',
    description: 'Acoustic storytelling at its finest',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    user: {
      username: 'folk_tales',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    trackCount: 28,
    likes: 5432,
    genre: 'Folk',
    platform: 'Custom',
    duration: '1h 45m'
  }
]

export const mockChillPlaylists: PlaylistData[] = [
  {
    id: 'c1',
    name: 'Rainy Day Vibes',
    description: 'Perfect for cozy indoor moments',
    coverUrl: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=400&h=400&fit=crop',
    user: {
      username: 'cozy_sounds',
      avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop'
    },
    trackCount: 45,
    likes: 3421,
    genre: 'Lo-Fi',
    platform: 'Spotify',
    duration: '2h 35m'
  },
  {
    id: 'c2',
    name: 'Sunday Morning Coffee',
    description: 'Gentle acoustic melodies for slow mornings',
    coverUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
    user: {
      username: 'morning_brew',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
    },
    trackCount: 32,
    likes: 2876,
    genre: 'Acoustic',
    platform: 'Apple Music',
    duration: '1h 58m'
  },
  {
    id: 'c3',
    name: 'Meditation & Focus',
    description: 'Ambient sounds for concentration',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    user: {
      username: 'mindful_music',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    trackCount: 18,
    likes: 1987,
    genre: 'Ambient',
    platform: 'Custom',
    duration: '1h 12m'
  }
]

export const mockWorkoutPlaylists: PlaylistData[] = [
  {
    id: 'w1',
    name: 'Beast Mode Activated',
    description: 'High-intensity tracks for maximum gains',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    user: {
      username: 'gym_warrior',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    trackCount: 35,
    likes: 9876,
    genre: 'Rock',
    platform: 'Spotify',
    duration: '2h 15m'
  },
  {
    id: 'w2',
    name: 'Cardio Pump',
    description: 'Fast-paced beats to keep you moving',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    user: {
      username: 'cardio_queen',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'
    },
    trackCount: 40,
    likes: 6543,
    genre: 'Electronic',
    platform: 'Apple Music',
    duration: '2h 30m'
  },
  {
    id: 'w3',
    name: 'Yoga Flow',
    description: 'Calming music for mindful movement',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    user: {
      username: 'yoga_zen',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    trackCount: 22,
    likes: 4321,
    genre: 'World',
    platform: 'Custom',
    duration: '1h 25m'
  }
]

export const mockGenrePlaylists: PlaylistData[] = [
  {
    id: 'g1',
    name: 'Jazz Cafe Sessions',
    description: 'Smooth jazz for sophisticated evenings',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    user: {
      username: 'jazz_cat',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    trackCount: 28,
    likes: 3456,
    genre: 'Jazz',
    platform: 'Spotify',
    duration: '1h 52m'
  },
  {
    id: 'g2',
    name: 'Classic Rock Legends',
    description: 'Timeless anthems from rock history',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    user: {
      username: 'rock_historian',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    trackCount: 50,
    likes: 8765,
    genre: 'Rock',
    platform: 'Apple Music',
    duration: '3h 12m'
  },
  {
    id: 'g3',
    name: 'R&B Essentials',
    description: 'Soulful vocals and smooth grooves',
    coverUrl: 'https://images.unsplash.com/photo-1518972734183-c78f6c0b5b23?w=400&h=400&fit=crop',
    user: {
      username: 'soul_sister',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'
    },
    trackCount: 38,
    likes: 5678,
    genre: 'R&B',
    platform: 'Spotify',
    duration: '2h 28m'
  },
  {
    id: 'g4',
    name: 'Country Roads',
    description: 'Stories from the heartland',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    user: {
      username: 'country_soul',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    },
    trackCount: 33,
    likes: 4567,
    genre: 'Country',
    platform: 'Custom',
    duration: '2h 5m'
  }
]

export const mockFriendRecommendations: PlaylistData[] = [
  {
    id: 'f1',
    name: 'Sarah\'s Study Mix',
    description: 'Because sarah_music likes focused lo-fi beats',
    coverUrl: 'https://images.unsplash.com/photo-1518972734183-c78f6c0b5b23?w=400&h=400&fit=crop',
    user: {
      username: 'sarah_music',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'
    },
    trackCount: 24,
    likes: 1234,
    genre: 'Lo-Fi',
    platform: 'Spotify',
    duration: '1h 35m'
  },
  {
    id: 'f2',
    name: 'Mike\'s Workout Bangers',
    description: 'Because mike_beats loves high-energy tracks',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    user: {
      username: 'mike_beats',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    trackCount: 30,
    likes: 2345,
    genre: 'Electronic',
    platform: 'Apple Music',
    duration: '1h 48m'
  }
] 