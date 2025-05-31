import { User, Playlist } from '@/types/playlist'

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'musiclover23',
    email: 'musiclover23@example.com',
    bio: 'Discovering new sounds daily 🎵',
    avatar_url: '/api/placeholder/64/64',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    followers_count: 1243,
    following_count: 567,
    playlists_count: 12
  },
  {
    id: '2',
    username: 'vinylcollector',
    email: 'vinyl@example.com',
    bio: 'Old soul, new beats',
    avatar_url: '/api/placeholder/64/64',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    followers_count: 2156,
    following_count: 234,
    playlists_count: 8
  },
  {
    id: '3',
    username: 'beatmaker_pro',
    email: 'beats@example.com',
    bio: 'Producer • DJ • Music lover',
    avatar_url: '/api/placeholder/64/64',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    followers_count: 3421,
    following_count: 890,
    playlists_count: 15
  }
]

// Mock playlists data
export const mockPlaylists: Playlist[] = [
  {
    id: 'p1',
    user_id: '1',
    name: 'Late Night Vibes',
    description: 'Perfect songs for those 2am moments',
    platform: 'spotify',
    track_count: 47,
    duration_ms: 11520000, // 3h 12m in milliseconds
    cover_image_url: '/api/placeholder/200/200',
    is_public: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    tags: ['chill', 'indie', 'electronic'],
    likes_count: 234,
    plays_count: 1560,
    user: mockUsers[0]
  },
  {
    id: 'p2',
    user_id: '1',
    name: 'Workout Bangers',
    description: 'High energy tracks to fuel your gym sessions',
    platform: 'apple',
    track_count: 32,
    duration_ms: 7680000, // 2h 8m in milliseconds
    cover_image_url: '/api/placeholder/200/200',
    is_public: true,
    created_at: '2024-02-03T00:00:00Z',
    updated_at: '2024-02-03T00:00:00Z',
    tags: ['workout', 'hip-hop', 'rock'],
    likes_count: 156,
    plays_count: 892,
    user: mockUsers[0]
  },
  {
    id: 'p3',
    user_id: '2',
    name: 'Jazz Classics Reimagined',
    description: 'Modern takes on timeless jazz standards',
    platform: 'spotify',
    track_count: 28,
    duration_ms: 9900000, // 2h 45m in milliseconds
    cover_image_url: '/api/placeholder/200/200',
    is_public: true,
    created_at: '2024-01-28T00:00:00Z',
    updated_at: '2024-01-28T00:00:00Z',
    tags: ['jazz', 'modern', 'classics'],
    likes_count: 445,
    plays_count: 2340,
    user: mockUsers[1]
  },
  {
    id: 'p4',
    user_id: '3',
    name: 'Underground Beats',
    description: 'Fresh beats from the underground scene',
    platform: 'spotify',
    track_count: 52,
    duration_ms: 13500000, // 3h 45m in milliseconds
    cover_image_url: '/api/placeholder/200/200',
    is_public: true,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
    tags: ['hip-hop', 'underground', 'beats'],
    likes_count: 678,
    plays_count: 3210,
    user: mockUsers[2]
  },
  {
    id: 'p5',
    user_id: '3',
    name: 'Ambient Soundscapes',
    description: 'Ethereal sounds for deep focus and meditation',
    platform: 'apple',
    track_count: 24,
    duration_ms: 8280000, // 2h 18m in milliseconds
    cover_image_url: '/api/placeholder/200/200',
    is_public: true,
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    tags: ['ambient', 'meditation', 'focus'],
    likes_count: 312,
    plays_count: 1890,
    user: mockUsers[2]
  }
] 