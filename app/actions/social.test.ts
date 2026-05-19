import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("sharePlaylist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { sharePlaylist } = await import("./social");
    await expect(
      sharePlaylist("playlist-1", [], "valid context here", "public"),
    ).rejects.toThrow(/logged in/i);
  });

  it("requires at least 10 characters of context", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const { sharePlaylist } = await import("./social");
    await expect(
      sharePlaylist("playlist-1", [], "short", "public"),
    ).rejects.toThrow(/10 characters/i);
  });

  it("inserts public share when shareType is public", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });

    const { sharePlaylist } = await import("./social");
    const result = await sharePlaylist(
      "playlist-1",
      [],
      "This is my share context",
      "public",
    );

    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("playlist_shares");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        playlist_id: "playlist-1",
        shared_by: "user-1",
        shared_with: null,
        share_type: "public",
      }),
    );
  });
});

describe("addPlaylistComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { addPlaylistComment } = await import("./social");
    await expect(
      addPlaylistComment("playlist-1", "Nice mix!"),
    ).rejects.toThrow(/logged in/i);
  });

  it("inserts comment and friend activity", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const commentInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "c1", comment_text: "Great picks" },
          error: null,
        }),
      }),
    });
    const activityInsert = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "playlist_comments") {
        return { insert: commentInsert };
      }
      if (table === "friend_activities") {
        return { insert: activityInsert };
      }
      return { insert: vi.fn() };
    });

    const { addPlaylistComment } = await import("./social");
    const result = await addPlaylistComment("playlist-1", "Great picks");

    expect(result.success).toBe(true);
    expect(activityInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        activity_type: "commented",
        playlist_id: "playlist-1",
      }),
    );
  });
});
