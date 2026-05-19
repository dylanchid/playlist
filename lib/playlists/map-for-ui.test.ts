import { describe, expect, it } from "vitest";
import {
  toFeaturedPlaylistItem,
  toPlaylistSectionItem,
} from "./map-for-ui";
import type { PlaylistWithUser } from "@/types/database";

const basePlaylist: PlaylistWithUser = {
  id: "p1",
  user_id: "u1",
  name: "Test Mix",
  description: "Desc",
  context_story: "Why I made this playlist for friends",
  platform: "spotify",
  track_count: 12,
  duration_ms: 3_600_000,
  cover_image_url: "https://example.com/cover.jpg",
  is_public: true,
  tags: ["chill", "indie"],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  user_profiles: {
    id: "u1",
    username: "dj_test",
    avatar_url: undefined,
  },
  likes_count: 5,
  plays_count: 2,
};

describe("map-for-ui", () => {
  it("maps to playlist section item with context story", () => {
    const item = toPlaylistSectionItem(basePlaylist);
    expect(item.name).toBe("Test Mix");
    expect(item.description).toBe("Why I made this playlist for friends");
    expect(item.platform).toBe("Spotify");
    expect(item.genre).toBe("Chill");
    expect(item.likes).toBe(5);
    expect(item.user.username).toBe("dj_test");
  });

  it("maps to featured carousel item", () => {
    const item = toFeaturedPlaylistItem(basePlaylist);
    expect(item.title).toBe("Test Mix");
    expect(item.curator.username).toBe("dj_test");
    expect(item.tags).toEqual(["chill", "indie"]);
    expect(item.likes).toBe(5);
  });
});
