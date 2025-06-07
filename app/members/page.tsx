'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Users, TrendingUp, UserPlus, Music, Heart, Play, Star, Award, Eye, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { SectionHeader } from '@/components/common/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Enhanced mock data with more realistic information
const featuredMembers = [
  {
    id: '1',
    username: 'musiclover92',
    displayName: 'Alex Rivera',
    avatarUrl: '/api/placeholder/80/80',
    playlistCount: 24,
    followerCount: 1200,
    totalLikes: 8500,
    joinedDate: '2023',
    isVerified: true,
    bio: 'Indie rock enthusiast & vinyl collector. Creating sonic journeys since 2019.',
    tags: ['Indie Rock', 'Alternative', 'Vinyl'],
    recentPlaylists: [
      { id: '1', name: 'Morning Coffee', coverUrl: '/api/placeholder/120/120', likes: 234 },
      { id: '2', name: 'Late Night Drives', coverUrl: '/api/placeholder/120/120', likes: 189 },
      { id: '3', name: 'Workout Beats', coverUrl: '/api/placeholder/120/120', likes: 156 },
      { id: '4', name: 'Study Session', coverUrl: '/api/placeholder/120/120', likes: 298 },
    ]
  },
  {
    id: '2',
    username: 'vinylvibes',
    displayName: 'Sam Chen',
    avatarUrl: '/api/placeholder/80/80',
    playlistCount: 45,
    followerCount: 2800,
    totalLikes: 15200,
    joinedDate: '2022',
    isVerified: true,
    bio: 'Jazz & Soul curator. Digging deep into the roots of modern music.',
    tags: ['Jazz', 'Soul', 'Blues'],
    recentPlaylists: [
      { id: '5', name: 'Smooth Jazz', coverUrl: '/api/placeholder/120/120', likes: 445 },
      { id: '6', name: 'Neo Soul', coverUrl: '/api/placeholder/120/120', likes: 387 },
      { id: '7', name: 'Blue Note Classics', coverUrl: '/api/placeholder/120/120', likes: 512 },
      { id: '8', name: 'Modern Jazz', coverUrl: '/api/placeholder/120/120', likes: 423 },
    ]
  },
  {
    id: '3',
    username: 'beatmaker',
    displayName: 'Jordan Kim',
    avatarUrl: '/api/placeholder/80/80',
    playlistCount: 18,
    followerCount: 950,
    totalLikes: 4200,
    joinedDate: '2024',
    isVerified: false,
    bio: 'Producer & DJ from LA. Electronic beats for every mood.',
    tags: ['Electronic', 'House', 'Techno'],
    recentPlaylists: [
      { id: '9', name: 'House Party', coverUrl: '/api/placeholder/120/120', likes: 167 },
      { id: '10', name: 'Deep House', coverUrl: '/api/placeholder/120/120', likes: 203 },
      { id: '11', name: 'Electronic Dreams', coverUrl: '/api/placeholder/120/120', likes: 145 },
      { id: '12', name: 'Festival Anthems', coverUrl: '/api/placeholder/120/120', likes: 289 },
    ]
  },
  {
    id: '4',
    username: 'synthwave80s',
    displayName: 'Riley Thompson',
    avatarUrl: '/api/placeholder/80/80',
    playlistCount: 31,
    followerCount: 1850,
    totalLikes: 9700,
    joinedDate: '2023',
    isVerified: true,
    bio: 'Retro synth & new wave collector. Bringing the 80s into the future.',
    tags: ['Synthwave', '80s', 'New Wave'],
    recentPlaylists: [
      { id: '13', name: 'Neon Nights', coverUrl: '/api/placeholder/120/120', likes: 356 },
      { id: '14', name: '80s Essentials', coverUrl: '/api/placeholder/120/120', likes: 423 },
      { id: '15', name: 'Synthwave Drive', coverUrl: '/api/placeholder/120/120', likes: 278 },
      { id: '16', name: 'New Wave Revival', coverUrl: '/api/placeholder/120/120', likes: 312 },
    ]
  }
];

const trendingMembers = [
  {
    id: '5',
    username: 'hiphophead',
    displayName: 'Marcus Johnson',
    avatarUrl: '/api/placeholder/64/64',
    isVerified: true,
    joinedDate: '2023',
    weeklyGrowth: '+12%',
    stats: {
      views: 15420,
      playlists: 28,
      followers: 3200,
      likes: 8950
    }
  },
  {
    id: '6',
    username: 'folkfinds',
    displayName: 'Emma Watson',
    avatarUrl: '/api/placeholder/64/64',
    isVerified: true,
    joinedDate: '2022',
    weeklyGrowth: '+8%',
    stats: {
      views: 12800,
      playlists: 35,
      followers: 2100,
      likes: 6780
    }
  },
  {
    id: '7',
    username: 'rocklegends',
    displayName: 'Dave Miller',
    avatarUrl: '/api/placeholder/64/64',
    isVerified: false,
    joinedDate: '2023',
    weeklyGrowth: '+15%',
    stats: {
      views: 9650,
      playlists: 42,
      followers: 1800,
      likes: 5430
    }
  }
];

const allMembers = [
  ...trendingMembers,
  {
    id: '8',
    username: 'popstar',
    displayName: 'Taylor Swift Fan',
    avatarUrl: '/api/placeholder/64/64',
    isVerified: false,
    joinedDate: '2024',
    stats: {
      views: 8200,
      playlists: 19,
      followers: 1200,
      likes: 4100
    }
  },
  {
    id: '9',
    username: 'metalhead',
    displayName: 'Iron Maiden',
    avatarUrl: '/api/placeholder/64/64',
    isVerified: false,
    joinedDate: '2023',
    stats: {
      views: 7800,
      playlists: 33,
      followers: 950,
      likes: 3800
    }
  }
];

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const nextFeatured = () => {
    // Navigation functionality can be implemented when needed
  };

  const prevFeatured = () => {
    // Navigation functionality can be implemented when needed
  };

  const filteredMembers = allMembers.filter(member =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <PageHeader
        title="Members"
        subtitle="Discover curators with exceptional taste"
        icon={<Users className="w-6 h-6 text-white" />}
        gradient="from-blue-500 to-purple-500"
        showSearch={true}
        searchPlaceholder="Search members..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        rightActions={
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <UserPlus className="w-4 h-4 mr-2" />
            Follow Users
          </Button>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-12">
        
        {/* Community Stats Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Join Our Community</h2>
              <p className="text-blue-100 text-lg">Connect with music lovers around the world</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold">2.4K+</div>
                <div className="text-blue-100 text-sm">Active Members</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">12K+</div>
                <div className="text-blue-100 text-sm">Playlists Shared</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">89K+</div>
                <div className="text-blue-100 text-sm">Songs Discovered</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">156K+</div>
                <div className="text-blue-100 text-sm">Connections Made</div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
        </section>

        {/* Featured Members Section */}
        <section>
          <SectionHeader
            title="Featured Members"
            subtitle="Discover curators with exceptional taste and influence"
            showNavigation={true}
            onPrevious={prevFeatured}
            onNext={nextFeatured}
            showViewAll={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredMembers.map((member) => (
              <Card key={member.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20" />
                
                <CardContent className="relative p-8 text-center">
                  {/* Profile Header */}
                  <div className="relative mb-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {member.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      {member.isVerified && (
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 rounded-full w-10 h-10 p-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <UserPlus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* User Info */}
                  <div className="mb-6">
                    <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">{member.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">@{member.username}</p>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{member.bio}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {member.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="space-y-1">
                      <div className="font-bold text-lg text-blue-600">{member.playlistCount}</div>
                      <div className="text-xs text-muted-foreground">Playlists</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-lg text-purple-600">{member.followerCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-lg text-pink-600">{(member.totalLikes / 1000).toFixed(1)}K</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                  </div>

                  {/* Recent Playlists Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {member.recentPlaylists.map((playlist) => (
                      <div key={playlist.id} className="relative group/playlist cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl aspect-square">
                          <Image
                            src={playlist.coverUrl}
                            alt={playlist.name}
                            fill
                            className="object-cover group-hover/playlist:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-black/0 group-hover/playlist:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white opacity-0 group-hover/playlist:opacity-100 transition-all duration-300 transform scale-0 group-hover/playlist:scale-100" />
                          </div>
                          
                          {/* Playlist Info Overlay */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium truncate">{playlist.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Heart className="w-3 h-3 text-red-400" />
                              <span className="text-white/80 text-xs">{playlist.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Member Since */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Member since {member.joinedDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trending Members Section */}
        <section>
          <SectionHeader
            title="Trending Members"
            subtitle="Most active and popular curators this week"
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            showViewAll={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingMembers.map((member, index) => (
              <Card key={member.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10" />
                
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-4">
                    {/* Enhanced Rank Badge */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        'bg-gradient-to-br from-amber-600 to-amber-800'
                      }`}>
                        {index === 0 ? <Award className="w-6 h-6" /> : `#${index + 1}`}
                      </div>
                      
                      {/* Growth Indicator */}
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        {member.weeklyGrowth}
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-white shadow-lg">
                          <AvatarImage src={member.avatarUrl} />
                          <AvatarFallback className="font-semibold">{member.displayName[0]}</AvatarFallback>
                        </Avatar>
                        
                        {member.isVerified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{member.displayName}</h3>
                        <p className="text-sm text-muted-foreground truncate">@{member.username}</p>
                      </div>
                    </div>

                    {/* Follow Button */}
                    <Button size="sm" className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Music className="w-4 h-4" />
                        <span className="font-bold text-sm">{member.stats.playlists}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Playlists</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold text-sm">{(member.stats.followers / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                        <Heart className="w-4 h-4" />
                        <span className="font-bold text-sm">{(member.stats.likes / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Eye className="w-4 h-4" />
                        <span className="font-bold text-sm">{(member.stats.views / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Members List */}
        <section>
          <SectionHeader
            title={searchQuery ? "Search Results" : "All Members"}
            subtitle={
              searchQuery 
                ? `${filteredMembers.length} members found for &quot;${searchQuery}&quot;`
                : "Discover new music curators to follow"
            }
          />
          
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="group overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                          <AvatarImage src={member.avatarUrl} />
                          <AvatarFallback className="font-semibold text-lg">{member.displayName[0]}</AvatarFallback>
                        </Avatar>
                        
                        {member.isVerified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{member.displayName}</h3>
                          {member.joinedDate === '2024' && (
                            <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">@{member.username}</p>
                        {member.joinedDate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {member.joinedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Stats */}
                    <div className="hidden lg:flex items-center gap-8 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <Music className="w-4 h-4" />
                        <div className="text-center">
                          <div className="font-bold">{member.stats.playlists}</div>
                          <div className="text-xs text-muted-foreground">playlists</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Users className="w-4 h-4" />
                        <div className="text-center">
                          <div className="font-bold">{member.stats.followers.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">followers</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <Heart className="w-4 h-4" />
                        <div className="text-center">
                          <div className="font-bold">{member.stats.likes.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">likes</div>
                        </div>
                      </div>
                      {member.stats.views && (
                        <div className="flex items-center gap-2 text-purple-600">
                          <Eye className="w-4 h-4" />
                          <div className="text-center">
                            <div className="font-bold">{member.stats.views.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">views</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow Button */}
                    <Button size="lg" className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 ml-6">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Follow
                    </Button>
                  </div>

                  {/* Mobile Stats */}
                  <div className="flex lg:hidden items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <Music className="w-4 h-4" />
                      <span className="font-medium">{member.stats.playlists}</span>
                      <span className="text-muted-foreground">playlists</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{member.stats.followers}</span>
                      <span className="text-muted-foreground">followers</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{member.stats.likes.toLocaleString()}</span>
                      <span className="text-muted-foreground">likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Empty State */}
          {searchQuery && filteredMembers.length === 0 && (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No members found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn&apos;t find any members matching &quot;{searchQuery}&quot;. Try adjusting your search or browse all members above.
              </p>
              <Button 
                onClick={() => setSearchQuery('')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Clear Search
              </Button>
            </Card>
          )}

          {/* Load More Button */}
          {!searchQuery && (
            <div className="text-center pt-8">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300"
              >
                Load More Members
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 