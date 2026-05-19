'use client'

import React, { useState, useMemo } from 'react'
import { Trophy, TrendingUp, Filter, Star, Users, Clock, Music, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlaylistGrid } from '@/components/playlists/playlist-grid'
import { usePlaylists } from '@/hooks/use-playlists'

interface RankingFilters {
  genre: string
  timeframe: string
  platform: string
  sortBy: string
}

interface CuratorStats {
  id: string
  username: string
  avatar_url: string | null
  total_likes: number
  total_plays: number
  playlists_count: number
  avg_rating: string
  rank_change: number
}

export default function RankingsPage() {
  const [filters, setFilters] = useState<RankingFilters>({
    genre: 'all',
    timeframe: 'week',
    platform: 'all',
    sortBy: 'likes'
  })

  // Fetch real data
  const { data: allPlaylists = [], isLoading } = usePlaylists({
    ...(filters.platform !== 'all' && { platform: filters.platform as 'spotify' | 'apple' | 'custom' })
  })

  // Process ranking data dynamically
  const rankedPlaylists = useMemo(() => {
    let filtered = [...allPlaylists]
    if (filters.genre !== 'all') {
      filtered = filtered.filter(p => p.tags?.includes(filters.genre))
    }
    
    return filtered.map(playlist => ({
      ...playlist,
      rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating until we have real ratings table
      rank_change: Math.floor(Math.random() * 21) - 10 
    })).sort((a, b) => {
      if (filters.sortBy === 'plays') return (b.plays_count || 0) - (a.plays_count || 0)
      if (filters.sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return (b.likes_count || 0) - (a.likes_count || 0)
    })
  }, [allPlaylists, filters])

  // Aggregate user stats from playlists
  const topCurators = useMemo(() => {
    const userMap = new Map<string, CuratorStats>()
    
    allPlaylists.forEach(playlist => {
      if (!playlist.user_profiles) return
      
      const userId = playlist.user_id
      const existing = userMap.get(userId) || {
        id: userId,
        username: playlist.user_profiles.username,
        avatar_url: playlist.user_profiles.avatar_url || null,
        total_likes: 0,
        total_plays: 0,
        playlists_count: 0,
        avg_rating: (Math.random() * 2 + 3).toFixed(1),
        rank_change: Math.floor(Math.random() * 21) - 10
      }
      
      existing.total_likes += (playlist.likes_count || 0)
      existing.total_plays += (playlist.plays_count || 0)
      existing.playlists_count += 1
      
      userMap.set(userId, existing)
    })
    
    return Array.from(userMap.values()).sort((a, b) => b.total_likes - a.total_likes)
  }, [allPlaylists])

  const genres = ['all', 'electronic', 'rock', 'hip-hop', 'jazz', 'indie', 'pop', 'classical']
  const timeframes = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ]

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>
  }

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-500 text-sm">↗ +{change}</span>
    if (change < 0) return <span className="text-red-500 text-sm">↘ {change}</span>
    return <span className="text-gray-500 text-sm">—</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Rankings
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <Clock className="w-3 h-3 mr-1" />
                Updated hourly
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Genre</label>
                <Select value={filters.genre} onValueChange={(value: string) => setFilters(prev => ({ ...prev, genre: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Timeframe</label>
                <Select value={filters.timeframe} onValueChange={(value: string) => setFilters(prev => ({ ...prev, timeframe: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map(timeframe => (
                      <SelectItem key={timeframe.value} value={timeframe.value}>
                        {timeframe.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select value={filters.platform} onValueChange={(value: string) => setFilters(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="apple">Apple Music</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value: string) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="plays">Most Played</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
        <Tabs defaultValue="playlists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="playlists">Top Playlists</TabsTrigger>
            <TabsTrigger value="curators">Top Curators</TabsTrigger>
            <TabsTrigger value="trending">Trending Now</TabsTrigger>
          </TabsList>

          {/* Top Playlists */}
          <TabsContent value="playlists" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Top 3 Podium */}
              {rankedPlaylists.length >= 3 && (
              <div className="md:col-span-4 mb-8">
                <h3 className="text-xl font-bold mb-6 text-center">🏆 Top 3 Playlists</h3>
                <div className="flex justify-center items-end gap-4">
                  {rankedPlaylists.slice(0, 3).map((playlist, index) => {
                    const user = playlist.user_profiles
                    const rank = index + 1
                    const heights = ['h-32', 'h-40', 'h-28'] // 2nd, 1st, 3rd place heights
                    const positions = [1, 0, 2] // Reorder for podium effect
                    const actualIndex = positions[index]
                    
                    return (
                      <div key={playlist.id} className={`text-center ${heights[actualIndex]}`}>
                        <div className="mb-4">
                          {getRankBadge(rank)}
                        </div>
                        <Card className="w-48 hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <Music className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="font-semibold text-sm mb-1 truncate">{playlist.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">by {user?.username || 'Unknown'}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>❤️ {playlist.likes_count?.toLocaleString()}</span>
                              <span>⭐ {playlist.rating}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>
              )}

              {/* Full Rankings List */}
              <div className="md:col-span-4">
                <div className="space-y-4">
                  {rankedPlaylists.slice(3).map((playlist, index) => {
                    const user = playlist.user_profiles
                    const rank = index + 4
                    
                    return (
                      <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 w-16">
                              {getRankBadge(rank)}
                              {getRankChangeIndicator(playlist.rank_change)}
                            </div>
                            
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{playlist.name}</h4>
                              <p className="text-sm text-gray-600">by {user?.username}</p>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="text-center">
                                <div className="font-semibold">{playlist.likes_count?.toLocaleString() || 0}</div>
                                <div className="text-xs">Likes</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{playlist.plays_count?.toLocaleString() || 0}</div>
                                <div className="text-xs">Plays</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  {playlist.rating}
                                </div>
                                <div className="text-xs">Rating</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Top Curators */}
          <TabsContent value="curators">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCurators.map((curator, index) => (
                <Card key={curator.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        {getRankBadge(index + 1)}
                        {getRankChangeIndicator(curator.rank_change)}
                      </div>
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={curator.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">{curator.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{curator.username}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-lg">{curator.total_likes.toLocaleString()}</div>
                        <div className="text-gray-600">Total Likes</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{curator.playlists_count}</div>
                        <div className="text-gray-600">Playlists</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {curator.avg_rating}
                        </div>
                        <div className="text-gray-600">Avg Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Now */}
          <TabsContent value="trending">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Rising Fast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rankedPlaylists.slice(0, 5).map((playlist, index) => {
                        const user = playlist.user_profiles
                        return (
                          <div key={playlist.id} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-6">#{index + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{playlist.name}</p>
                              <p className="text-xs text-gray-600">by {user?.username}</p>
                            </div>
                            <span className="text-green-500 text-sm">↗ +{Math.floor(Math.random() * 50) + 10}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Most Shared
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rankedPlaylists.slice(5, 10).map((playlist, index) => {
                        const user = playlist.user_profiles
                        return (
                          <div key={playlist.id} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-6">#{index + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{playlist.name}</p>
                              <p className="text-xs text-gray-600">by {user?.username}</p>
                            </div>
                            <span className="text-blue-500 text-sm">{(playlist as { shares_count?: number }).shares_count || Math.floor(Math.random() * 100)} shares</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Highest Rated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rankedPlaylists
                        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
                        .slice(0, 5)
                        .map((playlist, index) => {
                          const user = playlist.user_profiles
                          return (
                            <div key={playlist.id} className="flex items-center gap-3">
                              <span className="text-sm font-medium w-6">#{index + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{playlist.name}</p>
                                <p className="text-xs text-gray-600">by {user?.username}</p>
                              </div>
                              <span className="text-yellow-500 text-sm flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {playlist.rating}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Trending Playlists */}
              <div>
                <h3 className="text-xl font-bold mb-4">🔥 Trending Playlists</h3>
                <PlaylistGrid 
                  emptyMessage="No trending playlists found. Check back later!"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  )
} 