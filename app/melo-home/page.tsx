import Link from "next/link";
import { FeaturedCarousel } from "@/components/playlists/featured-carousel";
import { 
  mockTrendingPlaylists, 
  mockChillPlaylists, 
  mockWorkoutPlaylists, 
  mockGenrePlaylists,
  mockFriendRecommendations
} from "@/lib/mock-homepage-data";
import { Play, Heart, MoreHorizontal, Clock, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeloHome() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-wider">MELO</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-4">
          <div className="space-y-2">
            <Link href="#" className="flex items-center gap-3 text-orange-400 font-medium">
              <Music className="w-5 h-5" />
              Feed
            </Link>
            <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
              <Music className="w-5 h-5" />
              Playlists
            </Link>
            <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
              <Music className="w-5 h-5" />
              Statistics
            </Link>
          </div>

          <div className="pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Music</p>
            <div className="space-y-2">
              <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                Favourites
              </Link>
              <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
                Listen Later
              </Link>
              <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Music className="w-5 h-5" />
                History
              </Link>
              <Link href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Music className="w-5 h-5" />
                Podcasts
              </Link>
            </div>
          </div>

          <div className="pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Playlists</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Metalcore</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Electro</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Funk</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Disco</span>
              </div>
            </div>
            
            <Button variant="ghost" className="mt-4 text-orange-400 hover:text-orange-300 p-0 h-auto">
              Create new playlist +
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Featured Playlists Section */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-2">69 tracks • 4 hours 37 minutes</p>
          <h2 className="text-2xl font-bold text-white mb-4">Playlist of the day</h2>
          <div className="relative">
            <FeaturedCarousel />
          </div>
        </div>

        {/* Playlists Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-8 border-b border-gray-800">
            <button className="pb-4 text-orange-400 border-b-2 border-orange-400 font-medium">Playlists</button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">Artists</button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">Albums</button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">Streams</button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">Friends' playlists</button>
          </div>
        </div>

        {/* Playlist List */}
        <div className="space-y-3">
          {[
            { title: "Workout at the gym", tracks: "29 tracks", duration: "2h 15m", date: "23 June, 2023" },
            { title: "Tracks without lyrics", tracks: "35 tracks", duration: "2h 15m", date: "27 April, 2023" },
            { title: "Funny stuff", tracks: "108 tracks", duration: "6h 48m", date: "12 February, 2023" },
            { title: "Careful driving vibes", tracks: "84 tracks", duration: "5h 09m", date: "18 May, 2023" },
            { title: "Philosophy during walking", tracks: "52 tracks", duration: "3h 59m", date: "21 December, 2022" }
          ].map((playlist, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{playlist.title}</h3>
                <p className="text-sm text-gray-400">{playlist.tracks} • {playlist.duration}</p>
              </div>
              <div className="text-sm text-gray-400">{playlist.date}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white">
                  <Play className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-900 p-6">
        {/* Statistics */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Statistics</h3>
          <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg p-6 text-center">
            <h4 className="text-lg font-medium mb-2">Check the power of Melo</h4>
            <p className="text-sm text-gray-200 mb-4">Enjoy uninterrupted music streaming</p>
            <div className="text-3xl font-bold mb-2">247</div>
            <div className="text-sm text-gray-200">LIKES</div>
            <div className="text-2xl font-bold mb-2">84</div>
            <div className="text-sm text-gray-200">TRACKS</div>
          </div>
        </div>

        {/* New Releases */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">New Releases</h3>
            <Link href="#" className="text-orange-400 text-sm hover:text-orange-300">See all</Link>
          </div>
          <div className="space-y-3">
            {[
              { title: "Calamity", artist: "Annisokay", album: "Calamity", year: "2023" },
              { title: "Last Resort (Reimagined)", artist: "Falling in Reverse", album: "Single", year: "2023" }
            ].map((release, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{release.title}</h4>
                  <p className="text-xs text-gray-400">{release.artist} • {release.album} • {release.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listen More Often */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Listen More Often</h3>
          <div className="space-y-3">
            {[
              { title: "Blood Orange", artist: "Berried Alive" },
              { title: "Soul Decay", artist: "Make Them Suffer" },
              { title: "A Little Bit Off", artist: "Five Finger Death Punch" }
            ].map((track, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{track.title}</h4>
                  <p className="text-xs text-gray-400">{track.artist}</p>
                </div>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Favourite Artists */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Favourite Artists</h3>
            <Link href="#" className="text-orange-400 text-sm hover:text-orange-300">See all</Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Ice Nine Kills", subscribers: "132K subscribers" },
              { name: "Bloodywood", subscribers: "31K subscribers" },
              { name: "Bad Omens", subscribers: "183K subscribers" },
              { name: "Lorna Shore", subscribers: "294K subscribers" }
            ].map((artist, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{artist.name}</h4>
                  <p className="text-xs text-gray-400">{artist.subscribers}</p>
                </div>
                <button className="text-orange-400 text-lg">→</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 