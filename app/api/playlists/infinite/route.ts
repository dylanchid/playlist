import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enrichPlaylistsWithEngagement } from "@/lib/playlists/enrich-feed";
import type { PlaylistFilters, PaginatedResponse, PlaylistWithUser } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = page * limit;

    const filters: PlaylistFilters = {
      platform:
        (searchParams.get("platform") as
          | "spotify"
          | "apple"
          | "custom"
          | null) || undefined,
      tags: searchParams.get("tags")?.split(",") || undefined,
      user_id: searchParams.get("user_id") || undefined,
      search: searchParams.get("search") || undefined,
      is_public: searchParams.get("is_public") === "false" ? false : true,
    };

    let query = supabase
      .from("playlists")
      .select(
        `
        *,
        user_profiles (
          id,
          username,
          avatar_url
        )
      `,
        { count: "exact" },
      )
      .eq("is_public", true);

    if (filters.platform) {
      query = query.eq("platform", filters.platform);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const playlistIds = data?.map((p) => p.id) || [];
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id;

    const [reactionsData, playsData] = await Promise.all([
      supabase
        .from("playlist_reactions")
        .select("playlist_id,reaction_type,user_id")
        .in("playlist_id", playlistIds),
      supabase
        .from("playlist_plays")
        .select("playlist_id")
        .in("playlist_id", playlistIds),
    ]);

    const enrichedData = enrichPlaylistsWithEngagement(
      data ?? [],
      reactionsData.data ?? [],
      playsData.data ?? [],
      currentUserId,
    );

    const result: PaginatedResponse<PlaylistWithUser> = {
      data: enrichedData,
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching infinite playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 },
    );
  }
}
