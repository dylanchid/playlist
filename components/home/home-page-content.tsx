"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FeaturedCarousel } from "@/components/playlists/featured-carousel";
import { FriendActivityFeed } from "@/components/social/friend-activity-feed";
import { PlaylistSection } from "@/components/playlists/playlist-section";
import { useInfinitePlaylists, usePlaylists } from "@/hooks/use-playlists";
import {
  mapPlaylistsForFeatured,
  mapPlaylistsForSection,
} from "@/lib/playlists/map-for-ui";
import type { PlaylistFilters } from "@/types/database";

function EmptyHomeHint() {
  return (
    <p className="text-sm text-muted-foreground py-8 text-center">
      No public playlists yet.{" "}
      <Link href="/discover" className="underline hover:text-foreground">
        Explore discover
      </Link>{" "}
      or post your first playlist.
    </p>
  );
}

export function HomePageContent() {
  const { data: infiniteData, isLoading: feedLoading } = useInfinitePlaylists(
    {},
  );

  const allPlaylists = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.data) ?? [],
    [infiniteData],
  );

  const featured = useMemo(
    () => mapPlaylistsForFeatured(allPlaylists.slice(0, 6)),
    [allPlaylists],
  );

  const trending = useMemo(
    () => mapPlaylistsForSection(allPlaylists.slice(0, 12)),
    [allPlaylists],
  );

  const chillFilters: PlaylistFilters = { tags: ["chill"] };
  const workoutFilters: PlaylistFilters = { tags: ["workout"] };

  const { data: chillRaw = [], isLoading: chillLoading } =
    usePlaylists(chillFilters);
  const { data: workoutRaw = [], isLoading: workoutLoading } =
    usePlaylists(workoutFilters);

  const chill = useMemo(() => mapPlaylistsForSection(chillRaw), [chillRaw]);
  const workout = useMemo(
    () => mapPlaylistsForSection(workoutRaw),
    [workoutRaw],
  );

  const genreExplore = useMemo(
    () => mapPlaylistsForSection(allPlaylists.slice(12, 24)),
    [allPlaylists],
  );

  const friendPicks = useMemo(
    () => mapPlaylistsForSection(allPlaylists.slice(0, 8)),
    [allPlaylists],
  );

  const hasAnyData = allPlaylists.length > 0;

  return (
    <div className="flex-1 w-full">
      <section className="w-full py-8 border-b">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-auto lg:h-96">
            <div className="lg:col-span-3">
              <FeaturedCarousel
                playlists={featured}
                isLoading={feedLoading}
              />
            </div>
            <div className="lg:col-span-2">
              <FriendActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {!feedLoading && !hasAnyData && <EmptyHomeHint />}

      {friendPicks.length > 0 && (
        <PlaylistSection
          title="Because Your Friends Like..."
          subtitle="Discover music through your social network"
          playlists={friendPicks}
          layout="carousel"
          itemsPerRow={2}
        />
      )}

      {trending.length > 0 && (
        <PlaylistSection
          title="Trending Now"
          subtitle="What's popular on PlaylistShare"
          playlists={trending}
          layout="grid"
          itemsPerRow={4}
        />
      )}

      {!chillLoading && chill.length > 0 && (
        <PlaylistSection
          title="Chill & Study Vibes"
          subtitle="Perfect for focus and relaxation"
          playlists={chill}
          layout="carousel"
          itemsPerRow={3}
        />
      )}

      {!workoutLoading && workout.length > 0 && (
        <PlaylistSection
          title="Workout Energy"
          subtitle="Pump up your fitness routine"
          playlists={workout}
          layout="list"
        />
      )}

      {genreExplore.length > 0 && (
        <PlaylistSection
          title="Explore by Genre"
          subtitle="Dive deep into your favorite musical styles"
          playlists={genreExplore}
          layout="grid"
          itemsPerRow={4}
        />
      )}
    </div>
  );
}
