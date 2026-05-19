/** Resolve a URL to open the playlist in Spotify, Apple Music, or the app. */
export function getPlaylistPlayUrl(playlist: {
  id: string;
  platform: string;
  external_url?: string | null;
  external_id?: string | null;
}): string | null {
  if (playlist.external_url?.trim()) {
    return playlist.external_url.trim();
  }

  if (playlist.platform === "spotify" && playlist.external_id?.trim()) {
    return `https://open.spotify.com/playlist/${playlist.external_id.trim()}`;
  }

  return null;
}

/** Open playlist in external player or fall back to detail page. */
export function openPlaylistPlayer(
  playlist: {
    id: string;
    platform: string;
    external_url?: string | null;
    external_id?: string | null;
  },
  origin = typeof window !== "undefined" ? window.location.origin : "",
): void {
  const external = getPlaylistPlayUrl(playlist);
  const target = external ?? `${origin}/playlists/${playlist.id}`;
  window.open(target, "_blank", "noopener,noreferrer");
}
