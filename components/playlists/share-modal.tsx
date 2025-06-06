'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PlaylistWithUser } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContextInput } from './context-input'
import { FriendSelector } from '@/components/users/friend-selector'
import { Music, Clock, Share2, Copy, Check, Users, Globe } from 'lucide-react'
import { formatDuration } from '@/types/playlist'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

interface ShareModalProps {
  playlist: PlaylistWithUser
  isOpen: boolean
  onClose: () => void
  onShare?: (context: string, targetFriends?: string[], shareType?: 'friend' | 'public') => Promise<void>
}

export const ShareModal: React.FC<ShareModalProps> = ({
  playlist,
  isOpen,
  onClose,
  onShare
}) => {
  const [context, setContext] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [shareType, setShareType] = useState<'friend' | 'public'>('friend')
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState('')
  const { user } = useAuth()

  const canShare = context.trim().length >= 10 && (shareType === 'public' || selectedFriends.length > 0)
  const playlistUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/playlist/${playlist.id}`

  const handleShare = async () => {
    if (!canShare || !user) return
    
    setIsSharing(true)
    setShareError('')
    
    try {
      if (onShare) {
        await onShare(context.trim(), selectedFriends, shareType)
      } else {
        // Default implementation using Supabase
        const supabase = createClient()
        
        if (shareType === 'friend' && selectedFriends.length > 0) {
          // Create playlist shares for each selected friend
          const sharePromises = selectedFriends.map(friendId => 
            supabase
              .from('playlist_shares')
              .insert({
                playlist_id: playlist.id,
                shared_by: user.id,
                shared_with: friendId,
                share_context: context.trim(),
                share_type: 'friend'
              })
          )
          
          await Promise.all(sharePromises)
        }
      }
      
      // Reset form after successful share
      setContext('')
      setSelectedFriends([])
      onClose()
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Failed to share playlist')
    } finally {
      setIsSharing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const contextText = context.trim() || playlist.context_story
      const shareText = shareType === 'friend' && selectedFriends.length > 0 
        ? `🎵 ${playlist.name}\n\n"${contextText}"\n\nShared personally with you!\n\nListen: ${playlistUrl}`
        : `🎵 ${playlist.name}\n\n"${contextText}"\n\nListen: ${playlistUrl}`
      
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return 'bg-green-500 text-white'
      case 'apple':
        return 'bg-gray-900 text-white'
      case 'custom':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Playlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Playlist Preview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                {playlist.cover_image_url ? (
                  <Image
                    src={playlist.cover_image_url} 
                    alt={playlist.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Music className="w-8 h-8 text-white opacity-80" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg truncate">{playlist.name}</h3>
                  <Badge className={getPlatformBadgeColor(playlist.platform)}>
                    {playlist.platform === 'spotify' ? 'Spotify' : 
                     playlist.platform === 'apple' ? 'Apple Music' : 'Custom'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    {playlist.track_count} tracks
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(playlist.duration_ms)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={playlist.user_profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {playlist.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    by {playlist.user_profiles?.username || 'Unknown User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Show existing context if available */}
            {playlist.context_story && (
              <div className="mt-4 p-3 bg-background rounded-md border-l-4 border-primary">
                <p className="text-sm font-medium text-muted-foreground mb-1">Original story:</p>
                <p className="text-sm">{playlist.context_story}</p>
              </div>
            )}
          </div>

          {/* Share Type Selection */}
          <Tabs value={shareType} onValueChange={(value) => setShareType(value as 'friend' | 'public')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friend" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Share with Friends
              </TabsTrigger>
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Public Share
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friend" className="space-y-4 mt-4">
              <FriendSelector
                selectedFriends={selectedFriends}
                onFriendsChange={setSelectedFriends}
                disabled={isSharing}
              />
            </TabsContent>

            <TabsContent value="public" className="mt-4">
              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                📢 This will create a shareable link that anyone can access
              </div>
            </TabsContent>
          </Tabs>

          {/* Context Input */}
          <ContextInput
            value={context}
            onChange={setContext}
            placeholder={
              shareType === 'friend' 
                ? "Add your personal context for sharing this playlist. Why are you sharing it with these friends? What makes it special right now?"
                : "Add your context for this playlist. What's the story behind it? When is it perfect to listen to?"
            }
            label="Your Sharing Context"
            minLength={10}
            maxLength={300}
            error={shareError}
            disabled={isSharing}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              disabled={!canShare || isSharing}
              className="flex-1"
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  {shareType === 'friend' 
                    ? `Share with ${selectedFriends.length > 0 ? selectedFriends.length : ''} Friend${selectedFriends.length !== 1 ? 's' : ''}`
                    : 'Share Publicly'
                  }
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={!canShare || isSharing}
              className={cn(
                "flex items-center gap-2",
                copied && "bg-green-50 border-green-200 text-green-700"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <p className="font-medium mb-1">💡 Sharing with context makes music discovery meaningful!</p>
            <p>
              Your personal story helps friends understand when and why to listen to this playlist, 
              creating authentic music connections that algorithms can&apos;t replicate.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 