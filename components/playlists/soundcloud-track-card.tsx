'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Play, Pause, Heart, Repeat2, Share2, MoreHorizontal, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface SoundCloudTrackCardProps {
  track: {
    id: string
    title: string
    artist?: string
    user?: {
      username: string
      avatar_url?: string
    }
    cover_image_url?: string
    duration_ms: number
    created_at: string
    genre?: string
    tags?: string[]
    plays_count?: number
    likes_count?: number
    comments_count?: number
    reposts_count?: number
  }
  isPlaying?: boolean
  isLiked?: boolean
  onPlay?: () => void
  onLike?: () => void
  onShare?: () => void
  onRepost?: () => void
  showWaveform?: boolean
}

export const SoundCloudTrackCard: React.FC<SoundCloudTrackCardProps> = ({
  track,
  isPlaying = false,
  isLiked = false,
  onPlay,
  onLike,
  onShare,
  onRepost,
  showWaveform = true,
}) => {
  const [localLikes, setLocalLikes] = useState(track.likes_count || 0)
  const [liked, setLiked] = useState(isLiked)

  const handleLike = () => {
    setLiked(!liked)
    setLocalLikes(prev => liked ? prev - 1 : prev + 1)
    onLike?.()
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  // Mock waveform data
  const waveformBars = Array.from({ length: 150 }, () => Math.random() * 100)

  return (
    <div className="group bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={track.user?.avatar_url} alt={track.user?.username} />
            <AvatarFallback className="bg-orange-500 text-white">
              {track.user?.username?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <span className="font-medium hover:text-white cursor-pointer">
                    {track.user?.username || 'Unknown Artist'}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(track.created_at || new Date().toISOString())}</span>
                </div>
                <h3 className="text-white font-medium text-lg truncate group-hover:text-orange-400 cursor-pointer">
                  {track.title}
                </h3>
                {track.genre && (
                  <Badge variant="outline" className="mt-1 text-xs border-gray-600 text-gray-400">
                    #{track.genre}
                  </Badge>
                )}
              </div>
              
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Waveform and Controls */}
            <div className="flex items-center gap-4 mb-3">
              {/* Play Button */}
              <Button
                size="sm"
                onClick={onPlay}
                className="bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 rounded-full p-0 flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              {/* Waveform */}
              {showWaveform && (
                <div className="flex-1 flex items-center gap-0.5 h-8 overflow-hidden">
                  {waveformBars.map((height, index) => (
                    <div
                      key={index}
                      className={`w-1 bg-gradient-to-t transition-colors duration-200 ${
                        index < (isPlaying ? 60 : 0)
                          ? 'from-orange-400 to-orange-500'
                          : 'from-gray-600 to-gray-500'
                      } hover:from-orange-300 hover:to-orange-400 cursor-pointer`}
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  ))}
                </div>
              )}

              {/* Duration */}
              <span className="text-sm text-gray-400 font-mono flex-shrink-0">
                {formatDuration(track.duration_ms)}
              </span>
            </div>

            {/* Tags */}
            {track.tags && track.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {track.tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-400 hover:text-orange-400 hover:border-orange-400 cursor-pointer"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions and Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`gap-1 text-sm ${
                    liked 
                      ? 'text-red-500 hover:text-red-400' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  {localLikes > 0 && localLikes.toLocaleString()}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRepost}
                  className="gap-1 text-sm text-gray-400 hover:text-orange-500"
                >
                  <Repeat2 className="w-4 h-4" />
                  {track.reposts_count ? track.reposts_count.toLocaleString() : ''}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-sm text-gray-400 hover:text-blue-500"
                >
                  <MessageCircle className="w-4 h-4" />
                  {track.comments_count ? track.comments_count.toLocaleString() : ''}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {track.plays_count ? `${track.plays_count.toLocaleString()} plays` : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="text-gray-400 hover:text-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Track Cover (if available) */}
          {track.cover_image_url && (
            <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
              <Image
                src={track.cover_image_url}
                alt={track.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 