'use client'

import React, { useState, createContext, useContext } from 'react'
import { SoundCloudHeader } from '@/components/common/soundcloud-header'
import { SoundCloudPlayer } from '@/components/common/soundcloud-player'
import { Track } from '@/types'

interface PlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  volume: number
  isLiked: boolean
  isShuffled: boolean
  repeatMode: 'off' | 'one' | 'all'
  setCurrentTrack: (track: Track) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setVolume: (volume: number) => void
  setIsLiked: (liked: boolean) => void
  setIsShuffled: (shuffled: boolean) => void
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a SoundCloudLayout')
  }
  return context
}

interface SoundCloudLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    username: string
    avatar_url?: string
  }
  hidePlayer?: boolean
  hideHeader?: boolean
  onSearch?: (query: string) => void
  onUpload?: () => void
  onNotifications?: () => void
  onMessages?: () => void
  onLogout?: () => void
}

export const SoundCloudLayout: React.FC<SoundCloudLayoutProps> = ({
  children,
  user,
  hidePlayer = false,
  hideHeader = false,
  onSearch,
  onUpload,
  onNotifications,
  onMessages,
  onLogout,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isLiked, setIsLiked] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off')

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleNext = () => {
    console.log('Next track - implement playlist logic')
  }

  const handlePrevious = () => {
    console.log('Previous track - implement playlist logic')
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShuffle = () => {
    setIsShuffled(!isShuffled)
  }

  const handleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all']
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }

  const handleShare = () => {
    if (currentTrack) {
      console.log('Share track:', currentTrack.id)
    }
  }

  const handleShowQueue = () => {
    console.log('Show queue')
  }

  const handleFullscreen = () => {
    console.log('Toggle fullscreen player')
  }

  const playerContextValue: PlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isLiked,
    isShuffled,
    repeatMode,
    setCurrentTrack,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    setIsLiked,
    setIsShuffled,
    setRepeatMode,
  }

  return (
    <PlayerContext.Provider value={playerContextValue}>
      <div className="min-h-screen bg-soundcloud-gray-950 flex flex-col">
        {/* Header */}
        {!hideHeader && (
          <SoundCloudHeader
            user={user}
            onSearch={onSearch}
            onUpload={onUpload}
            onNotifications={onNotifications}
            onMessages={onMessages}
            onLogout={onLogout}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 ${!hidePlayer ? 'mb-20' : ''}`}>
          {children}
        </main>

        {/* Bottom Player */}
        {!hidePlayer && (
          <SoundCloudPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            volume={volume}
            isLiked={isLiked}
            isShuffled={isShuffled}
            repeatMode={repeatMode}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onLike={handleLike}
            onShuffle={handleShuffle}
            onRepeat={handleRepeat}
            onShare={handleShare}
            onShowQueue={handleShowQueue}
            onFullscreen={handleFullscreen}
          />
        )}
      </div>
    </PlayerContext.Provider>
  )
} 