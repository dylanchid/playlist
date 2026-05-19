import type { ReactionType } from "@/types/database";

const emptyReactions = (): Record<ReactionType, number> => ({
  fire: 0,
  perfect: 0,
  thoughtful: 0,
  energy: 0,
});

export type RawReactionRow = {
  playlist_id: string;
  reaction_type: string;
  user_id: string;
};

export type RawPlayRow = { playlist_id: string };

/**
 * Merges playlist rows with reaction and play aggregates (used by infinite feed API).
 */
export function enrichPlaylistsWithEngagement<T extends { id: string }>(
  playlists: T[] | null | undefined,
  rawReactions: RawReactionRow[] | null | undefined,
  rawPlays: RawPlayRow[] | null | undefined,
  currentUserId: string | undefined,
): Array<
  T & {
    likes_count: number;
    plays_count: number;
    reactions: Record<ReactionType, number>;
    user_reaction: ReactionType | null;
  }
> {
  const reactions = rawReactions ?? [];
  const plays = rawPlays ?? [];
  const list = playlists ?? [];

  const reactionCounts: Record<string, Record<ReactionType, number>> = {};
  const totalReactionCounts: Record<string, number> = {};
  const userReactions: Record<string, ReactionType> = {};

  for (const reaction of reactions) {
    const playlistId = reaction.playlist_id;
    if (!reactionCounts[playlistId]) {
      reactionCounts[playlistId] = emptyReactions();
    }
    const rt = reaction.reaction_type as ReactionType;
    reactionCounts[playlistId][rt] += 1;
    totalReactionCounts[playlistId] = (totalReactionCounts[playlistId] || 0) + 1;
    if (currentUserId && reaction.user_id === currentUserId) {
      userReactions[playlistId] = rt;
    }
  }

  const playCounts: Record<string, number> = {};
  for (const play of plays) {
    playCounts[play.playlist_id] = (playCounts[play.playlist_id] || 0) + 1;
  }

  return list.map((playlist) => ({
    ...playlist,
    likes_count: totalReactionCounts[playlist.id] || 0,
    plays_count: playCounts[playlist.id] || 0,
    reactions: reactionCounts[playlist.id] || emptyReactions(),
    user_reaction: userReactions[playlist.id] ?? null,
  }));
}
