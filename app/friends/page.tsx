'use client'

import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlaylistGrid } from '@/components/playlists/playlist-grid'
import { FriendActivityFeed } from '@/components/social/friend-activity-feed'
import { getFriends, getSuggestions, getFriendPlaylists, followUserAction } from '@/app/actions/user'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  playlists_count?: number;
  followers_count?: number;
}

interface PlaylistData {
  id: string;
  name: string;
  cover_image_url: string | null;
  context_story?: string | null;
  user_profiles?: {
    username: string;
  } | null;
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState<ProfileData[]>([])
  const [suggestions, setSuggestions] = useState<ProfileData[]>([])
  const [friendsPlaylists, setFriendsPlaylists] = useState<PlaylistData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [friendsData, suggestionsData, playlistsData] = await Promise.all([
          getFriends(),
          getSuggestions(),
          getFriendPlaylists()
        ])
        setFriends(friendsData as unknown as ProfileData[])
        setSuggestions(suggestionsData as unknown as ProfileData[])
        setFriendsPlaylists(playlistsData as unknown as PlaylistData[])
      } catch (error) {
        console.error("Error loading friends data:", error)
        toast.error("Failed to load some friends data.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleFollow = async (userId: string) => {
    try {
      const res = await followUserAction(userId)
      if (res.success) {
        toast.success("Followed successfully!")
        // Optimistically update
        const followedUser = suggestions.find(s => s.id === userId)
        if (followedUser) {
          setFriends(prev => [...prev, followedUser])
          setSuggestions(prev => prev.filter(s => s.id !== userId))
        }
      } else {
        toast.error(res.error || "Failed to follow")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Friends
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search friends..."
                  className="pl-10 rounded-full w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{isLoading ? '-' : friends.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Friends</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{isLoading ? '-' : friendsPlaylists.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Friend Playlists</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{isLoading ? '-' : suggestions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Suggestions</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          {/* Activity Feed */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FriendActivityFeed />
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Friend Updates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : friends.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No friends yet.</div>
                    ) : (
                      friends.slice(0, 4).map(friend => (
                        <div key={friend.id} className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={friend?.avatar_url || ''} />
                            <AvatarFallback>{friend?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{friend?.username || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">Connected</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Add</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : suggestions.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No suggestions right now.</div>
                    ) : (
                      suggestions.slice(0, 3).map(suggestion => (
                        <div key={suggestion.id} className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={suggestion?.avatar_url || ''} />
                            <AvatarFallback>{suggestion?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{suggestion?.username || 'Unknown'}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollow(suggestion.id)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Friends List */}
          <TabsContent value="friends">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map(friend => (
                <Card key={friend.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={friend?.avatar_url || ''} />
                        <AvatarFallback className="text-lg">{friend?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{friend?.username || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{friend?.bio || 'Music lover'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        Following
                      </Button>
                      <Button variant="outline" size="sm">
                        Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {friends.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  You haven&apos;t followed anyone yet. Check the suggestions tab!
                </div>
              )}
            </div>
          </TabsContent>

          {/* Friends' Playlists */}
          <TabsContent value="playlists">
            {friendsPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Note: In a real implementation we'd map PlaylistCard here */}
                {friendsPlaylists.map(playlist => (
                  <Card key={playlist.id} className="overflow-hidden">
                    {playlist.cover_image_url && (
                      <div className="w-full h-48 bg-muted relative">
                        <Image src={playlist.cover_image_url} alt={playlist.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold truncate">{playlist.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">By {playlist.user_profiles?.username}</p>
                      {playlist.context_story && (
                        <p className="text-sm text-muted-foreground line-clamp-2 italic">&quot;{playlist.context_story}&quot;</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <PlaylistGrid emptyMessage="No playlists from friends yet. Follow some friends to see their playlists!" />
            )}
          </TabsContent>

          {/* Friend Suggestions */}
          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map(suggestion => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={suggestion?.avatar_url || ''} />
                        <AvatarFallback className="text-lg">{suggestion?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{suggestion?.username || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{suggestion?.bio || 'Music lover'}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleFollow(suggestion.id)}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 