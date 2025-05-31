'use client'

import React, { useState } from 'react'
import { SoundCloudHeader } from '@/components/common/soundcloud-header'
import { SoundCloudProfileHeader } from '@/components/users/soundcloud-profile-header'
import { SoundCloudProfileNav } from '@/components/users/soundcloud-profile-nav'
import { SoundCloudTrackCard } from '@/components/playlists/soundcloud-track-card'
import { SoundCloudPlayer } from '@/components/common/soundcloud-player'
import { TabsContent } from '@/components/ui/tabs'
import { Track } from '@/types'

export default function SoundCloudDemoPage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Mock user data
  const mockUser = {
    id: '1',
    username: 'kahunaSlayer',
    bio: 'Wanderer of worlds, ponderer of things, doer of deeds. I\'m a man that enjoys exotic pleasures, ancient sounds, rare fruits. Life\'s about living',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop&crop=center',
    location: 'SF',
    website: 'https://kahunaslayer.com',
    spotify_id: 'kahunaslayer_spotify',
    apple_music_id: undefined,
  }

  const mockStats = {
    followers: 1,
    following: 7,
    tracks: 0,
    playlists: 5,
  }

  // Mock tracks data
  const mockTracks = [
    {
      id: '1',
      title: 'Ambient Interlude',
      artist: 'kahunaSlayer',
      user: {
        username: 'kahunaSlayer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      },
      cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      duration_ms: 257000, // 4:17
      created_at: '2024-01-15T10:30:00Z',
      genre: 'ambient',
      tags: ['ambient', 'chill', 'atmospheric', 'meditation'],
      plays_count: 1234,
      likes_count: 42,
      comments_count: 8,
      reposts_count: 12,
    },
    {
      id: '2',
      title: 'Electronic Dreams',
      artist: 'kahunaSlayer',
      user: {
        username: 'kahunaSlayer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      },
      cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
      duration_ms: 324000, // 5:24
      created_at: '2024-01-12T15:45:00Z',
      genre: 'electronic',
      tags: ['electronic', 'synth', 'futuristic', 'dance'],
      plays_count: 2567,
      likes_count: 89,
      comments_count: 15,
      reposts_count: 23,
    },
    {
      id: '3',
      title: 'Organic Soundscape',
      artist: 'kahunaSlayer',
      user: {
        username: 'kahunaSlayer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      },
      cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      duration_ms: 412000, // 6:52
      created_at: '2024-01-08T09:20:00Z',
      genre: 'experimental',
      tags: ['experimental', 'organic', 'field-recording', 'nature'],
      plays_count: 892,
      likes_count: 31,
      comments_count: 5,
      reposts_count: 7,
    },
  ]

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      setCurrentTime(0)
    }
  }

  const handlePlayerPlay = () => {
    setIsPlaying(true)
  }

  const handlePlayerPause = () => {
    setIsPlaying(false)
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
  }

  return (
    <div className="min-h-screen bg-soundcloud-gray-950">
      {/* Header */}
      <SoundCloudHeader
        user={mockUser}
        onSearch={(query) => console.log('Search:', query)}
        onUpload={() => console.log('Upload clicked')}
        onNotifications={() => console.log('Notifications clicked')}
        onMessages={() => console.log('Messages clicked')}
        onLogout={() => console.log('Logout clicked')}
      />

      {/* Profile Header */}
      <SoundCloudProfileHeader
        user={mockUser}
        stats={mockStats}
        isOwnProfile={true}
        onFollow={() => console.log('Follow clicked')}
        onMessage={() => console.log('Message clicked')}
      />

      {/* Profile Navigation */}
      <SoundCloudProfileNav
        defaultTab="tracks"
        trackCount={mockTracks.length}
        playlistCount={5}
        albumCount={2}
        repostCount={8}
      >
        <TabsContent value="all" className="bg-soundcloud-gray-950 min-h-screen">
          <div className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-6">All Content</h2>
            <div className="space-y-0">
              {mockTracks.map((track) => (
                <SoundCloudTrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  onPlay={() => handlePlay(track)}
                  onLike={() => console.log('Like track:', track.id)}
                  onShare={() => console.log('Share track:', track.id)}
                  onRepost={() => console.log('Repost track:', track.id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="popular" className="bg-soundcloud-gray-950 min-h-screen">
          <div className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-6">Popular Tracks</h2>
            <div className="space-y-0">
              {mockTracks
                .sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0))
                .map((track) => (
                  <SoundCloudTrackCard
                    key={track.id}
                    track={track}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={() => handlePlay(track)}
                    onLike={() => console.log('Like track:', track.id)}
                    onShare={() => console.log('Share track:', track.id)}
                    onRepost={() => console.log('Repost track:', track.id)}
                  />
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tracks" className="bg-soundcloud-gray-950 min-h-screen">
          <div className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-6">Tracks</h2>
            <div className="space-y-0">
              {mockTracks.map((track) => (
                <SoundCloudTrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  onPlay={() => handlePlay(track)}
                  onLike={() => console.log('Like track:', track.id)}
                  onShare={() => console.log('Share track:', track.id)}
                  onRepost={() => console.log('Repost track:', track.id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="albums" className="bg-soundcloud-gray-950 min-h-screen">
          <div className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
            <div className="text-center py-12">
              <p className="text-soundcloud-gray-400">No albums yet</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="bg-soundcloud-gray-950 min-h-screen">
          <div className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-6">Playlists</h2>
            <div className="text-center py-12">
              <p className="text-soundcloud-gray-400">Playlists coming soon...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reposts" className="bg-soundcloud-gray-950 min-h-screen">
          <div className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-6">Reposts</h2>
            <div className="text-center py-12">
              <p className="text-soundcloud-gray-400">No reposts yet</p>
            </div>
          </div>
        </TabsContent>
      </SoundCloudProfileNav>

      {/* Bottom Player */}
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
        onLike={() => console.log('Like current track')}
        onShuffle={() => console.log('Toggle shuffle')}
        onRepeat={() => console.log('Toggle repeat')}
        onShare={() => console.log('Share current track')}
        onShowQueue={() => console.log('Show queue')}
        onFullscreen={() => console.log('Fullscreen player')}
      />

      {/* Bottom spacing for player */}
      <div className="h-20"></div>
    </div>
  )
} 