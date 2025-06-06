'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlaylistContextDisplay } from './playlist-context-display'
import { ContextInput } from './context-input'
import { ShareModal } from './share-modal'
import { mockPlaylists } from '@/lib/mockData'
import { Badge } from '@/components/ui/badge'
import { Music, Share2, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { PlaylistWithUser } from '@/types/database'

export const ContextDemo: React.FC = () => {
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistWithUser>(mockPlaylists[0] as PlaylistWithUser)
  const [demoContext, setDemoContext] = useState('')
  const [playlists, setPlaylists] = useState<PlaylistWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchUserPlaylists = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          user_profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('is_public', true)
        .limit(3)

      if (error) {
        console.error('Error fetching playlists:', error)
        // Fall back to mock data
        setPlaylists(mockPlaylists.slice(0, 3) as PlaylistWithUser[])
      } else {
        if (data && data.length > 0) {
          setPlaylists(data as PlaylistWithUser[])
          setSelectedPlaylist(data[0] as PlaylistWithUser)
        } else {
          // No real playlists found, use mock data
          setPlaylists(mockPlaylists.slice(0, 3) as PlaylistWithUser[])
        }
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
      setPlaylists(mockPlaylists.slice(0, 3) as PlaylistWithUser[])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchUserPlaylists()
    } else {
      // Use mock data when not authenticated
      setPlaylists(mockPlaylists as PlaylistWithUser[])
      setLoading(false)
    }
  }, [user, fetchUserPlaylists])

  const handleShare = async (context: string, targetFriends?: string[], shareType?: 'friend' | 'public') => {
    if (!user) {
      alert('Please sign in to share playlists!')
      return
    }

    try {
      const supabase = createClient()
      
      if (shareType === 'friend' && targetFriends && targetFriends.length > 0) {
        // Create playlist shares for each selected friend
        const sharePromises = targetFriends.map(friendId => 
          supabase
            .from('playlist_shares')
            .insert({
              playlist_id: selectedPlaylist.id,
              shared_by: user.id,
              shared_with: friendId,
              share_context: context,
              share_type: 'friend'
            })
        )
        
        await Promise.all(sharePromises)
        alert(`Playlist shared with ${targetFriends.length} friend${targetFriends.length !== 1 ? 's' : ''}!`)
      } else {
        // Public share - just show success (could implement public share logic here)
        alert(`Playlist shared publicly with context: "${context}"`)
      }
    } catch (error) {
      console.error('Error sharing playlist:', error)
      alert('Failed to share playlist. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Context-Required Sharing Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience PlaylistShare's core feature: every playlist comes with a personal story. 
          This is what makes music discovery meaningful and authentic.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary">
            ✨ PRD Core Feature Implemented
          </Badge>
          {user ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <User className="w-3 h-3 mr-1" />
              Authenticated as {user.email}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <User className="w-3 h-3 mr-1" />
              Demo Mode (Sign in for full experience)
            </Badge>
          )}
        </div>
      </div>

      {/* Context Display Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Context Stories in Action
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-48" />
                    </div>
                    <div className="h-8 bg-muted rounded w-16" />
                  </div>
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">{playlist.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlaylist(playlist)
                      setShowShareModal(true)
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <PlaylistContextDisplay 
                  contextStory={playlist.context_story}
                  variant="featured"
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Interactive Context Input */}
      <Card>
        <CardHeader>
          <CardTitle>Try Creating Your Own Context</CardTitle>
        </CardHeader>
        <CardContent>
          <ContextInput
            value={demoContext}
            onChange={setDemoContext}
            placeholder="Describe a playlist you'd create. What's the story behind it? When would someone listen to it?"
            label="Your Playlist Story"
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">💡 Great context stories include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The inspiration or moment that sparked the playlist</li>
              <li>When and where it's perfect to listen</li>
              <li>The emotional journey or progression of the songs</li>
              <li>Personal memories or experiences connected to the music</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Feature Benefits */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <CardTitle>Why Context-Required Sharing Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ With Context Stories</h4>
              <ul className="text-sm space-y-1">
                <li>• Friends understand when to listen</li>
                <li>• Creates emotional connection to music</li>
                <li>• Builds authentic music relationships</li>
                <li>• Makes discovery feel personal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">❌ Without Context</h4>
              <ul className="text-sm space-y-1">
                <li>• Just another random playlist link</li>
                <li>• No understanding of purpose or mood</li>
                <li>• Feels like algorithmic recommendation</li>
                <li>• Easy to ignore or forget</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <ShareModal
        playlist={selectedPlaylist}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
      />

      <p className="text-sm text-gray-600 mb-2">
        You&apos;ve successfully created a playlist with context! This is what makes 
        PlaylistShare special.
      </p>
      <p className="text-sm text-gray-600">
        Your friends will see this story when you share the playlist, helping them understand 
        when and why to listen to it.
      </p>
    </div>
  )
} 