import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlaylistWithUser } from '@/types/database';
import { toast } from 'sonner';

export function usePlaylistShare() {
  const [isSharing, setIsSharing] = useState(false);
  const supabase = createClient();

  const sharePlaylist = async (
    playlist: PlaylistWithUser,
    context: string,
    targetFriends?: string[],
    shareType: 'friend' | 'public' = 'public'
  ) => {
    setIsSharing(true);
    try {
      if (shareType === 'friend' && targetFriends && targetFriends.length > 0) {
        // Create playlist shares for each selected friend
        const sharePromises = targetFriends.map(friendId => 
          supabase
            .from('playlist_shares')
            .insert({
              playlist_id: playlist.id,
              shared_by: playlist.user_id,
              shared_with: friendId,
              share_context: context,
              share_type: 'friend'
            })
        );
        
        await Promise.all(sharePromises);
        toast.success(`Shared playlist with ${targetFriends.length} friend${targetFriends.length !== 1 ? 's' : ''}`);
      } else {
        // Update playlist to be public and add context
        const { error } = await supabase
          .from('playlists')
          .update({
            is_public: true,
            context_story: context
          })
          .eq('id', playlist.id);

        if (error) throw error;
        toast.success('Playlist shared publicly');
      }
    } catch (error) {
      console.error('Error sharing playlist:', error);
      toast.error('Failed to share playlist');
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    sharePlaylist,
    isSharing
  };
} 