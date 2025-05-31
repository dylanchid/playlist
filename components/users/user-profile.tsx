import React, { useState } from 'react';
import { Calendar, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfileProps } from '@/types/playlist';

export const UserProfile: React.FC<UserProfileProps> = ({ user, onFollow, isFollowing }) => {
  const [following, setFollowing] = useState(isFollowing);
  const [followerCount, setFollowerCount] = useState(user.followers_count || 0);

  const handleFollow = () => {
    setFollowing(!following);
    setFollowerCount(prev => following ? prev - 1 : prev + 1);
    onFollow(user.id);
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32"></div>
      <CardContent className="relative pt-0 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 px-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.username}
            </h1>
            {user.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 mb-3">
                {user.bio}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {followerCount} followers
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {user.following_count || 0} following
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleFollow}
            variant={following ? "outline" : "default"}
            className={following 
              ? "border-purple-200 text-purple-600 hover:bg-purple-50" 
              : "bg-purple-600 hover:bg-purple-700 text-white"
            }
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 px-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.playlists_count || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Playlists
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {followerCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Followers
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.following_count || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Following
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 