"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/users/user-avatar";
import { PlaylistCard } from "@/components/playlists/playlist-card";
import { useProfile, useUserStats, useUserPlaylists } from "@/hooks/use-profile";
import { useAuth } from "@/contexts/auth-context";
import { 
  Calendar, 
  Settings, 
  Users, 
  Music2, 
  Lock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface UserProfileDisplayProps {
  username: string;
}

export function UserProfileDisplay({ username }: UserProfileDisplayProps) {
  const { user, profile: currentUserProfile } = useAuth();
  
  // Suppress unused variable warning
  console.log('Current user:', user);
  const { data: profile, isLoading: profileLoading } = useProfile(username);
  const { data: stats, isLoading: statsLoading } = useUserStats(username);
  const { data: playlists, isLoading: playlistsLoading } = useUserPlaylists(username);

  const isOwnProfile = currentUserProfile?.username === username;
  const isPrivate = profile?.is_private && !isOwnProfile;

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">
              The user @{username} does not exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Private Profile</h2>
            <p className="text-muted-foreground">
              This user has set their profile to private.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <UserAvatar
                  avatarUrl={profile.avatar_url}
                  username={profile.username}
                  displayName={profile.display_name}
                  size="xl"
                  className="mb-4"
                />
                {isOwnProfile && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/profile/edit">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">
                      {profile.display_name || profile.username}
                    </h1>
                    {profile.is_private && (
                      <Badge variant="secondary">
                        <Lock className="mr-1 h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">
                    @{profile.username}
                  </p>
                  
                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined {formatDistanceToNow(new Date(profile.created_at))} ago
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Music2 className="h-4 w-4" />
                      <span className="text-2xl font-bold">
                        {statsLoading ? "-" : stats?.playlistCount || 0}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Playlists</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-2xl font-bold">
                        {statsLoading ? "-" : stats?.followersCount || 0}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-2xl font-bold">
                        {statsLoading ? "-" : stats?.followingCount || 0}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Playlists Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isOwnProfile ? "Your Playlists" : `${profile.display_name || profile.username}'s Playlists`}
            </h2>
            {isOwnProfile && (
              <Button asChild>
                <Link href="/playlists/create">
                  Create Playlist
                </Link>
              </Button>
            )}
          </div>

          {playlistsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => {
                const playlistUser = {
                  id: playlist.user_profiles?.id || playlist.user_id,
                  username: playlist.user_profiles?.username || 'Unknown User',
                  avatar_url: playlist.user_profiles?.avatar_url || undefined,
                  bio: '',
                  followers_count: 0,
                  following_count: 0,
                  playlists_count: 0,
                  created_at: '',
                  updated_at: ''
                };
                
                return (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    user={playlistUser}
                    onLike={() => {}} // TODO: Implement like functionality
                    onShare={() => {}} // TODO: Implement share functionality
                    isLiked={false} // TODO: Implement like checking
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {isOwnProfile ? "No playlists yet" : "No public playlists"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isOwnProfile 
                    ? "Create your first playlist to get started sharing your music!"
                    : `${profile.display_name || profile.username} hasn't shared any playlists yet.`
                  }
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link href="/playlists/create">
                      Create Your First Playlist
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 