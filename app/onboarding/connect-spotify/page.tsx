'use client';

import {
  SpotifyConnectBrandButton,
  SpotifyConnectionStatus,
} from '@/components/spotify';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { skipSpotifyConnectionAction } from '@/app/actions/onboarding';

export default function OnboardingConnectSpotifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-md p-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Spotify</CardTitle>
            <CardDescription>
              Connect your Spotify account to import your playlists and start
              sharing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <SpotifyConnectBrandButton
              onSuccess={() => {
                // The button's internal logic should handle redirection on success.
                // We might want to redirect to /onboarding/select-genres from the callback.
                // For now, the action itself handles redirection.
              }}
            />
            <SpotifyConnectionStatus showUserInfo={false} />
          </CardContent>
          <CardFooter className="flex-col">
            <form action={skipSpotifyConnectionAction} className="w-full">
              <Button type="submit" variant="link" className="w-full">
                Skip for Now
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 