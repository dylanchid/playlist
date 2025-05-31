import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PlaylistGrid } from "@/components/playlists/playlist-grid";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="text-xl font-bold">
              🎵 PlaylistShare
            </Link>
            <div className="hidden md:flex items-center gap-4 ml-8">
              <Link href="/discover" className="hover:text-foreground/80 transition-colors">
                Discover
              </Link>
              <Link href="/friends" className="hover:text-foreground/80 transition-colors">
                Friends
              </Link>
              <Link href="/rankings" className="hover:text-foreground/80 transition-colors">
                Rankings
              </Link>
              <Link href="/create" className="hover:text-foreground/80 transition-colors">
                Create
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {hasEnvVars && <AuthButton />}
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-16 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-5 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Discover & Share Amazing Playlists
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with music lovers, discover new playlists, and share your favorite tracks 
              from Spotify, Apple Music, and custom collections.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/auth/sign-up"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/discover"
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Playlists
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Playlists */}
        <section className="w-full py-16">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Playlists</h2>
                <p className="text-muted-foreground">
                  Discover the most popular playlists from our community
                </p>
              </div>
              <Link 
                href="/playlists"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            
            {/* Always show playlists - either from Supabase or mock data */}
            {hasEnvVars ? (
              <PlaylistGrid />
            ) : (
              <div>
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Demo Mode</span>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                    Showing sample playlists. Set up your Supabase environment to connect real data.
                  </p>
                </div>
                <PlaylistGrid showMockData />
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose PlaylistShare?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎵</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
                <p className="text-muted-foreground">
                  Import and share playlists from Spotify, Apple Music, or create custom ones
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Social Discovery</h3>
                <p className="text-muted-foreground">
                  Follow friends, like playlists, and discover new music through our community
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
                <p className="text-muted-foreground">
                  Find playlists by genre, mood, artist, or browse by tags and popularity
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full border-t py-8">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            © 2024 PlaylistShare. Powered by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-medium hover:text-foreground transition-colors"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
