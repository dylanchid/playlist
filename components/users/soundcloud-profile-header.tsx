'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Settings, UserPlus, Share2, MoreHorizontal } from 'lucide-react'

interface SoundCloudProfileHeaderProps {
  user: {
    id: string
    username: string
    bio?: string
    avatar_url?: string
    banner_url?: string
    location?: string
    website?: string
    spotify_id?: string
    apple_music_id?: string
  }
  stats: {
    followers: number
    following: number
    tracks: number
    playlists?: number
  }
  isOwnProfile?: boolean
  isFollowing?: boolean
  onFollow?: () => void
  onMessage?: () => void
}

export const SoundCloudProfileHeader: React.FC<SoundCloudProfileHeaderProps> = ({
  user,
  stats,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onMessage,
}) => {
  const defaultBanner = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop&crop=center'
  
  return (
    <div className="relative w-full">
      {/* Banner Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
        <Image
          src={user.banner_url || defaultBanner}
          alt={`${user.username}'s banner`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Content Overlay */}
      <div className="relative px-4 md:px-8 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          {/* Avatar */}
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl bg-white">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback className="bg-orange-500 text-white text-4xl md:text-5xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {user.username}
                </h1>
                {user.location && (
                  <p className="text-white/80 text-sm md:text-base mb-2">
                    📍 {user.location}
                  </p>
                )}
                {user.bio && (
                  <p className="text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={onFollow}
                      className={`${
                        isFollowing
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      } transition-all duration-200`}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    {onMessage && (
                      <Button
                        onClick={onMessage}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                      >
                        Message
                      </Button>
                    )}
                  </>
                )}
                
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Navigation */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-4 md:px-8">
          {/* Stats Row */}
          <div className="flex items-center gap-8 py-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.followers.toLocaleString()}</div>
              <div className="text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.following.toLocaleString()}</div>
              <div className="text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.tracks.toLocaleString()}</div>
              <div className="text-gray-400">Tracks</div>
            </div>
            {stats.playlists !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.playlists.toLocaleString()}</div>
                <div className="text-gray-400">Playlists</div>
              </div>
            )}
          </div>

          {/* Connected Platforms */}
          <div className="flex items-center gap-2 pb-4">
            {user.spotify_id && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                🎵 Spotify Connected
              </Badge>
            )}
            {user.apple_music_id && (
              <Badge className="bg-gray-800 hover:bg-gray-700 text-white">
                🍎 Apple Music Connected
              </Badge>
            )}
            {user.website && (
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                🌐 Website
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 