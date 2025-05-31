'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { PlaylistWithUser, PlaylistTrack } from '@/types'

interface PlaylistContextType {
  // Current playlist being viewed/played
  currentPlaylist: PlaylistWithUser | null
  setCurrentPlaylist: (playlist: PlaylistWithUser | null) => void
  
  // Current track being played
  currentTrack: PlaylistTrack | null
  setCurrentTrack: (track: PlaylistTrack | null) => void
  
  // Player state
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  
  // Volume control
  volume: number
  setVolume: (volume: number) => void
  
  // Playback position
  currentTime: number
  setCurrentTime: (time: number) => void
  
  // Shuffle and repeat modes
  isShuffled: boolean
  setIsShuffled: (shuffled: boolean) => void
  
  repeatMode: 'none' | 'one' | 'all'
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void
  
  // Queue management
  queue: PlaylistTrack[]
  setQueue: (tracks: PlaylistTrack[]) => void
  
  currentTrackIndex: number
  setCurrentTrackIndex: (index: number) => void
  
  // Player actions
  playTrack: (track: PlaylistTrack, playlist?: PlaylistWithUser) => void
  playNext: () => void
  playPrevious: () => void
  togglePlay: () => void
  
  // Liked playlists (for quick access)
  likedPlaylistIds: Set<string>
  setLikedPlaylistIds: (ids: Set<string>) => void
  toggleLikedPlaylist: (playlistId: string) => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

interface PlaylistProviderProps {
  children: ReactNode
}

export function PlaylistProvider({ children }: PlaylistProviderProps) {
  // Playlist state
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistWithUser | null>(null)
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null)
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Playback modes
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none')
  
  // Queue management
  const [queue, setQueue] = useState<PlaylistTrack[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  
  // Liked playlists
  const [likedPlaylistIds, setLikedPlaylistIds] = useState<Set<string>>(new Set())

  // Player actions
  const playTrack = (track: PlaylistTrack, playlist?: PlaylistWithUser) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    
    if (playlist) {
      setCurrentPlaylist(playlist)
      // Set up queue from playlist tracks
      if (playlist.tracks) {
        setQueue(playlist.tracks)
        const trackIndex = playlist.tracks.findIndex(t => t.id === track.id)
        setCurrentTrackIndex(trackIndex >= 0 ? trackIndex : 0)
      }
    }
  }

  const playNext = () => {
    if (queue.length === 0) return
    
    let nextIndex = currentTrackIndex + 1
    
    // Handle repeat modes
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0
      } else if (repeatMode === 'one') {
        nextIndex = currentTrackIndex
      } else {
        setIsPlaying(false)
        return
      }
    }
    
    setCurrentTrackIndex(nextIndex)
    setCurrentTrack(queue[nextIndex])
    setCurrentTime(0)
  }

  const playPrevious = () => {
    if (queue.length === 0) return
    
    let prevIndex = currentTrackIndex - 1
    
    // If we're at the beginning, go to the end if repeat all is on
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1
      } else {
        prevIndex = 0
      }
    }
    
    setCurrentTrackIndex(prevIndex)
    setCurrentTrack(queue[prevIndex])
    setCurrentTime(0)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleLikedPlaylist = (playlistId: string) => {
    const newLikedIds = new Set(likedPlaylistIds)
    if (newLikedIds.has(playlistId)) {
      newLikedIds.delete(playlistId)
    } else {
      newLikedIds.add(playlistId)
    }
    setLikedPlaylistIds(newLikedIds)
  }

  const value: PlaylistContextType = {
    // State
    currentPlaylist,
    setCurrentPlaylist,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentTime,
    setCurrentTime,
    isShuffled,
    setIsShuffled,
    repeatMode,
    setRepeatMode,
    queue,
    setQueue,
    currentTrackIndex,
    setCurrentTrackIndex,
    likedPlaylistIds,
    setLikedPlaylistIds,
    
    // Actions
    playTrack,
    playNext,
    playPrevious,
    togglePlay,
    toggleLikedPlaylist,
  }

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext)
  if (context === undefined) {
    throw new Error('usePlaylistContext must be used within a PlaylistProvider')
  }
  return context
}

// Convenience hooks for specific parts of the context
export function useCurrentPlaylist() {
  const { currentPlaylist, setCurrentPlaylist } = usePlaylistContext()
  return { currentPlaylist, setCurrentPlaylist }
}

export function usePlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    playTrack,
    playNext,
    playPrevious,
    togglePlay,
    setVolume,
    setCurrentTime,
  } = usePlaylistContext()
  
  return {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    playTrack,
    playNext,
    playPrevious,
    togglePlay,
    setVolume,
    setCurrentTime,
  }
}

export function usePlaybackControls() {
  const {
    isShuffled,
    setIsShuffled,
    repeatMode,
    setRepeatMode,
    queue,
    setQueue,
    currentTrackIndex,
    setCurrentTrackIndex,
  } = usePlaylistContext()
  
  return {
    isShuffled,
    setIsShuffled,
    repeatMode,
    setRepeatMode,
    queue,
    setQueue,
    currentTrackIndex,
    setCurrentTrackIndex,
  }
} 