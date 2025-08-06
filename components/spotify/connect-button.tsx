'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Music } from 'lucide-react';
import { initiateSpotifyConnectionAction } from '@/app/actions/spotify';
import { useTransition } from 'react';
import { usePathname } from 'next/navigation';

interface SpotifyConnectButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SpotifyConnectButton({
  variant = 'default',
  size = 'default',
  className,
  onError
}: SpotifyConnectButtonProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleConnect = () => {
    const formData = new FormData();
    formData.append('pathname', pathname);
    startTransition(() => {
        // The action now handles success/error and redirection
        initiateSpotifyConnectionAction(formData)
            .catch(err => {
                const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Spotify';
                onError?.(errorMessage);
                toast.error('Connection failed', {
                    description: errorMessage,
                });
            });
    });
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      variant={variant}
      size={size}
      className={className}
    >
      <Music className="w-4 h-4 mr-2" />
      {isPending ? 'Connecting...' : 'Connect Spotify'}
    </Button>
  );
}

// Spotify-branded version with green styling
export function SpotifyConnectBrandButton({
  size = 'default',
  className,
  onError
}: Omit<SpotifyConnectButtonProps, 'variant'>) {
  return (
    <SpotifyConnectButton
      variant="default"
      size={size}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}

      onError={onError}
    />
  );
} 