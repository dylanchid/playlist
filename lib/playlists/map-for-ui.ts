import type { PlaylistWithUser, ReactionType } from "@/types/database";
import { formatDuration } from "@/utils/format";

/** Shape expected by PlaylistSection and related home UI. */
export interface PlaylistSectionItem {
  id: string;
  name: string;
  description: string;
  coverUrl: string | null;
  user: {
    username: string;
    avatar_url: string | null;
  };
  trackCount: number;
  likes: number;
  genre: string;
  platform: string;
  duration?: string;
}

/** Shape for FeaturedCarousel slides. */
export interface FeaturedPlaylistItem {
  id: string;
  title: string;
  description: string;
  curator: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
  trackCount: number;
  coverUrl: string | null;
  tags: string[];
  platform: string;
  genre: string;
  likes: number;
}

function platformLabel(platform: PlaylistWithUser["platform"]): string {
  switch (platform) {
    case "spotify":
      return "Spotify";
    case "apple":
      return "Apple Music";
    case "custom":
      return "Custom";
    default:
      return "Custom";
  }
}

function primaryGenre(tags: string[] | undefined): string {
  if (tags && tags.length > 0) {
    const tag = tags[0];
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }
  return "Mixed";
}

function engagementCount(playlist: PlaylistWithUser): number {
  if (typeof playlist.likes_count === "number") {
    return playlist.likes_count;
  }
  if (playlist.reactions) {
    return Object.values(playlist.reactions).reduce((sum, n) => sum + n, 0);
  }
  return 0;
}

export function toPlaylistSectionItem(
  playlist: PlaylistWithUser,
): PlaylistSectionItem {
  const username = playlist.user_profiles?.username ?? "unknown";

  return {
    id: playlist.id,
    name: playlist.name,
    description:
      playlist.context_story?.trim() ||
      playlist.description?.trim() ||
      "",
    coverUrl: playlist.cover_image_url ?? null,
    user: {
      username,
      avatar_url: playlist.user_profiles?.avatar_url ?? null,
    },
    trackCount: playlist.track_count ?? 0,
    likes: engagementCount(playlist),
    genre: primaryGenre(playlist.tags),
    platform: platformLabel(playlist.platform),
    duration: playlist.duration_ms
      ? formatDuration(playlist.duration_ms)
      : undefined,
  };
}

export function toFeaturedPlaylistItem(
  playlist: PlaylistWithUser,
): FeaturedPlaylistItem {
  const username = playlist.user_profiles?.username ?? "unknown";

  return {
    id: playlist.id,
    title: playlist.name,
    description:
      playlist.context_story?.trim() ||
      playlist.description?.trim() ||
      "",
    curator: {
      name: displayNameFromUsername(username),
      username,
      avatar_url: playlist.user_profiles?.avatar_url ?? null,
    },
    trackCount: playlist.track_count ?? 0,
    coverUrl: playlist.cover_image_url ?? null,
    tags: playlist.tags ?? [],
    platform: platformLabel(playlist.platform),
    genre: primaryGenre(playlist.tags),
    likes: engagementCount(playlist),
  };
}

function displayNameFromUsername(username: string): string {
  return username
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapPlaylistsForSection(
  playlists: PlaylistWithUser[] | undefined,
): PlaylistSectionItem[] {
  return (playlists ?? []).map(toPlaylistSectionItem);
}

export function mapPlaylistsForFeatured(
  playlists: PlaylistWithUser[] | undefined,
): FeaturedPlaylistItem[] {
  return (playlists ?? []).map(toFeaturedPlaylistItem);
}

/** Sum reaction map when present on enriched rows. */
export function totalReactions(
  reactions: Record<ReactionType, number> | undefined,
): number {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((sum, n) => sum + n, 0);
}
