// Mock data for homepage sections

export interface PlaylistData {
  id: string
  name: string
  description: string
  coverUrl: string | null
  user: {
    username: string
    avatar_url: string | null
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
    coverUrl: null,
    user: {
      username: 'trendspotter',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'hiphop_head',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'edm_lover',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'folk_tales',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'cozy_sounds',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'morning_brew',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'mindful_music',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'gym_warrior',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'cardio_queen',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'yoga_zen',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'jazz_cat',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'rock_historian',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'soul_sister',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'country_soul',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'sarah_music',
      avatar_url: null
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
    coverUrl: null,
    user: {
      username: 'mike_beats',
      avatar_url: null
    },
    trackCount: 30,
    likes: 2345,
    genre: 'Electronic',
    platform: 'Apple Music',
    duration: '1h 48m'
  }
] 