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
    context_story: "Created during my final semester working on my thesis project. These tracks kept me focused during those 2am coding sessions when the world was quiet and it was just me and my code. Each song was carefully chosen to match the flow of deep work - starts with ambient sounds to clear the mind, then builds subtle energy to keep me motivated through the tough debugging sessions.",
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
    context_story: "Started this playlist when I began training for my first marathon. Every song was tested during actual workouts - if it didn't make me want to push harder or run faster, it didn't make the cut. The progression is intentional: explosive openers for warming up, steady bangers for the main sets, and epic finishers for when you need that last burst of energy.",
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
    context_story: "My grandfather was a jazz musician in the 60s, and I grew up listening to his vinyl collection. This playlist bridges our generations - taking the standards he loved and finding contemporary artists who honor the tradition while bringing fresh perspectives. Perfect for Sunday morning coffee or when you want to feel connected to music history.",
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
    context_story: "Discovered these artists through late-night SoundCloud rabbit holes and local underground shows. Each track represents a different city's underground scene - from Detroit techno basements to Brooklyn warehouse parties. This is for when you want to hear the future of hip-hop before it hits the mainstream.",
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
    context_story: "Created during a particularly stressful period when I needed to find calm in chaos. Each track was chosen for its ability to create mental space - some for active meditation, others for background focus during creative work. The progression moves from more structured ambient pieces to pure soundscapes that dissolve into the background of consciousness.",
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