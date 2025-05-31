'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2,
  Heart,
  Share2,
  List,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Track } from '@/types'

interface SoundCloudPlayerProps {
  currentTrack?: Track | null
  isPlaying?: boolean
  currentTime?: number
  volume?: number
  isLiked?: boolean
  isShuffled?: boolean
  repeatMode?: 'off' | 'one' | 'all'
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onSeek?: (time: number) => void
  onVolumeChange?: (volume: number) => void
  onLike?: () => void
  onShuffle?: () => void
  onRepeat?: () => void
  onShare?: () => void
  onShowQueue?: () => void
  onFullscreen?: () => void
}

export const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({
  currentTrack,
  isPlaying = false,
  currentTime = 0,
  volume = 50,
  isLiked = false,
  isShuffled = false,
  repeatMode = 'off',
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onLike,
  onShuffle,
  onRepeat,
  onShare,
  onShowQueue,
  onFullscreen,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  if (!currentTrack) {
    return null
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`
  }

  const progress = (currentTime / currentTrack.duration_ms) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl z-50">
      {/* Progress Bar */}
      <div className="relative h-1 bg-gray-700 cursor-pointer">
        <div 
          className="absolute h-full bg-orange-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute h-full w-full"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const newProgress = (clickX / rect.width) * 100
            const newTime = (newProgress / 100) * currentTrack.duration_ms
            onSeek?.(newTime)
          }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
            {currentTrack.cover_image_url ? (
              <Image
                src={currentTrack.cover_image_url}
                alt={currentTrack.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate text-sm">
              {currentTrack.title}
            </h4>
            <p className="text-gray-400 text-xs truncate">
              {currentTrack.user?.username || currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`${
                isLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShuffle}
            className={`${
              isShuffled 
                ? 'text-orange-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            className="text-gray-400 hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            onClick={isPlaying ? onPause : onPlay}
            className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            className="text-gray-400 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRepeat}
            className={`${
              repeatMode !== 'off' 
                ? 'text-orange-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 min-w-fit">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(currentTrack.duration_ms)}</span>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="text-gray-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onShowQueue}
            className="text-gray-400 hover:text-white"
          >
            <List className="w-4 h-4" />
          </Button>

          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-800 p-3 rounded-lg shadow-xl">
                <div className="h-20 flex items-center">
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => onVolumeChange?.(value[0])}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className="h-16"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreen}
            className="text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 