"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Music, Settings, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UserAvatar } from "@/components/users/user-avatar";
import { UnifiedAuthModal } from "@/components/auth/unified-auth-modal";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Discover", href: "/discover" },
  { name: "Members", href: "/members" },
  { name: "Friends", href: "/friends" },
  { name: "Rankings", href: "/rankings" },
  { name: "Create", href: "/create" },
];

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Debug logging for auth state changes
  useEffect(() => {
    console.log('🏠 [NAVBAR] Auth state changed:', {
      timestamp: new Date().toISOString(),
      user: !!user,
      userId: user?.id,
      userEmail: user?.email,
      profile: !!profile,
      profileId: profile?.id,
      profileUsername: profile?.username,
      loading,
      shouldShowProfile: !!(user && profile),
      shouldShowAuthButton: !user
    });
    
    // Additional debugging for authentication state
    if (user && !profile && !loading) {
      console.warn('⚠️ [NAVBAR] User exists but no profile found!', {
        userId: user.id,
        userEmail: user.email,
        userMetadata: user.user_metadata
      });
    }
    
    if (!user && !loading) {
      console.log('🔐 [NAVBAR] No user detected, showing auth button');
    }
    
    if (user && profile) {
      console.log('✅ [NAVBAR] User and profile both exist, showing user menu');
    }
  }, [user, profile, loading]);

  const handleSignOut = async () => {
    console.log('🚪 Navbar signOut triggered');
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      console.log('✅ Navbar signOut completed');
    } catch (error) {
      console.error('❌ Navbar signOut error:', error);
    }
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Music className="h-6 w-6" />
              <span className="text-xl font-bold">PlaylistShare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : user && profile ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {profile.display_name || profile.username}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <UserAvatar
                          avatarUrl={profile.avatar_url}
                          username={profile.username}
                          displayName={profile.display_name}
                          size="md"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile.display_name || profile.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          @{profile.username}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${profile.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                                      </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button onClick={openAuthModal} variant="default">
                  Sign Up / Log In
                </Button>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user && profile && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      {profile.display_name || profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{profile.username}
                    </p>
                  </div>
                )}
                
                {!user && (
                  <Button 
                    onClick={openAuthModal}
                    className="mt-4 w-full"
                    variant="default"
                  >
                    Sign Up / Log In
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectTo={pathname}
      />
    </>
  );
} 