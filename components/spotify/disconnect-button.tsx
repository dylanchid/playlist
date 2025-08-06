'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Unlink } from 'lucide-react';
import { disconnectSpotifyAction } from '@/app/actions/spotify';
import { useTransition } from 'react';

interface SpotifyDisconnectButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SpotifyDisconnectButton({
  variant = 'outline',
  size = 'default',
  className,
  onSuccess,
  onError
}: SpotifyDisconnectButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDisconnect = async () => {
    startTransition(async () => {
      try {
        const result = await disconnectSpotifyAction();
        
        if (result.error) {
          onError?.(result.error);
          toast.error('Disconnect failed', {
            description: result.error,
          });
        } else {
          toast.success('Spotify disconnected', {
            description: 'Your Spotify account has been disconnected successfully.',
          });
          onSuccess?.();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect Spotify';
        onError?.(errorMessage);
        
        toast.error('Disconnect failed', {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isPending}
        >
          <Unlink className="w-4 h-4 mr-2" />
          Disconnect Spotify
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect Spotify Account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove your Spotify connection and stop syncing your playlists.
            You can reconnect at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDisconnect}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Disconnecting...' : 'Disconnect'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 