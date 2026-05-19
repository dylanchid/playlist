'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpotifyConnectionStatus, useSpotifyUser } from '@/lib/spotify/queries';
import { SpotifyConnectBrandButton } from './connect-button';
import { SpotifyDisconnectButton } from './disconnect-button';
import { CheckCircle, XCircle, Clock, Music } from 'lucide-react';

interface SpotifyConnectionStatusProps {
  showUserInfo?: boolean;
  className?: string;
}

export function SpotifyConnectionStatus({
  showUserInfo = true,
  className
}: SpotifyConnectionStatusProps) {
  const { data: connectionStatus, isLoading: connectionLoading } = useSpotifyConnectionStatus();
  const { data: spotifyUser, isLoading: userLoading } = useSpotifyUser();

  if (connectionLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Spotify Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = connectionStatus?.connected ?? false;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Spotify Connection
        </CardTitle>
        <CardDescription>
          {isConnected 
            ? 'Your Spotify account is connected and ready to import playlists'
            : 'Connect your Spotify account to import and sync your playlists'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <Badge variant="destructive">
                Not Connected
              </Badge>
            </>
          )}
        </div>

        {/* Rate Limit Info */}
        {isConnected && 'rateLimit' in (connectionStatus ?? {}) && connectionStatus?.rateLimit && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              API calls remaining: {connectionStatus.rateLimit.remaining}/{connectionStatus.rateLimit.limit}
            </span>
          </div>
        )}

        {/* User Info */}
        {isConnected && showUserInfo && (
          <div className="space-y-2">
            {userLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : spotifyUser ? (
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Account:</span> {spotifyUser.display_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span> {spotifyUser.email}
                </div>
                {spotifyUser.followers && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Followers:</span> {spotifyUser.followers.total.toLocaleString()}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isConnected ? (
            <SpotifyDisconnectButton />
          ) : (
            <SpotifyConnectBrandButton 
              className="w-full"
              onSuccess={() => {
                // Connection status will be automatically updated via React Query
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
