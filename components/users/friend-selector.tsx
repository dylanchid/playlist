'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { UserProfile } from '@/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Users, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

interface FriendSelectorProps {
  selectedFriends: string[]
  onFriendsChange: (friendIds: string[]) => void
  disabled?: boolean
}

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  selectedFriends,
  onFriendsChange,
  disabled = false
}) => {
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const fetchFriends = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const supabase = createClient()

      // Get user's friends (following relationship)
      const { data: followsData, error: followsError } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          user_profiles!user_follows_following_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', user.id)
        .eq('status', 'connected')

      if (followsError) {
        throw followsError
      }

      // Extract friend profiles
      const friendProfiles = followsData
        ?.map(follow => follow.user_profiles)
        ?.filter(profile => profile !== null) as UserProfile[] || []

      setFriends(friendProfiles)
    } catch (err) {
      console.error('Error fetching friends:', err)
      setError('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFriendToggle = (friendId: string) => {
    if (disabled) return
    
    const newSelection = selectedFriends.includes(friendId)
      ? selectedFriends.filter(id => id !== friendId)
      : [...selectedFriends, friendId]
    
    onFriendsChange(newSelection)
  }

  const clearSelection = () => {
    if (!disabled) {
      onFriendsChange([])
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          Loading friends...
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-24 mb-1" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchFriends}>
          Try Again
        </Button>
      </div>
    )
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No friends yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Find and follow friends to share playlists with them
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Share with friends</span>
          {selectedFriends.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedFriends.length} selected
            </Badge>
          )}
        </div>
        {selectedFriends.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={disabled}
            className="text-xs h-auto p-1"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search friends..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Selected Friends (if any) */}
      {selectedFriends.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map(friendId => {
              const friend = friends.find(f => f.id === friendId)
              if (!friend) return null
              
              return (
                <div key={friendId} className="flex items-center gap-2 bg-background rounded-full pl-1 pr-2 py-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={friend.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {friend.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{friend.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFriendToggle(friendId)}
                    disabled={disabled}
                    className="h-auto w-auto p-0 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {filteredFriends.map(friend => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => handleFriendToggle(friend.id)}
            >
              <Checkbox
                checked={selectedFriends.includes(friend.id)}
                disabled={disabled}
                className="pointer-events-none"
              />
              <Avatar className="w-8 h-8">
                <AvatarImage src={friend.avatar_url} />
                <AvatarFallback className="text-sm">
                  {friend.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{friend.username}</p>
                {friend.display_name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {friend.display_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {searchQuery && filteredFriends.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No friends found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  )
} 