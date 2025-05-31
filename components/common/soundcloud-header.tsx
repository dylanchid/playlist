'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Upload, 
  Bell, 
  Mail, 
  Menu,
  Home,
  Music,
  Users,
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SoundCloudHeaderProps {
  user?: {
    id: string
    username: string
    avatar_url?: string
  }
  onSearch?: (query: string) => void
  onUpload?: () => void
  onNotifications?: () => void
  onMessages?: () => void
  onLogout?: () => void
}

export const SoundCloudHeader: React.FC<SoundCloudHeaderProps> = ({
  user,
  onSearch,
  onUpload,
  onNotifications,
  onMessages,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: TrendingUp },
    { href: '/playlists', label: 'Playlists', icon: Music },
    { href: '/following', label: 'Following', icon: Users },
  ]

  return (
    <header className="sticky top-0 z-40 bg-soundcloud-gray-900 border-b border-soundcloud-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-soundcloud-gradient rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                PlaylistShare
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-soundcloud-gray-300 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-soundcloud-gray-400" />
              <Input
                type="text"
                placeholder="Search for tracks, artists, playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-soundcloud-gray-800 border-soundcloud-gray-700 text-white placeholder:text-soundcloud-gray-400 focus:border-soundcloud-orange-500 focus:ring-soundcloud-orange-500"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Upload Button */}
            <Button
              onClick={onUpload}
              className="bg-soundcloud-orange-500 hover:bg-soundcloud-orange-600 text-white hidden sm:flex"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNotifications}
                  className="text-soundcloud-gray-400 hover:text-white relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-soundcloud-orange-500 rounded-full"></span>
                </Button>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMessages}
                  className="text-soundcloud-gray-400 hover:text-white"
                >
                  <Mail className="w-5 h-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="bg-soundcloud-orange-500 text-white text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56 bg-soundcloud-gray-800 border-soundcloud-gray-700" 
                    align="end" 
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal text-white">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-soundcloud-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-soundcloud-gray-700" />
                    <DropdownMenuItem className="text-soundcloud-gray-300 hover:text-white hover:bg-soundcloud-gray-700">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-soundcloud-gray-300 hover:text-white hover:bg-soundcloud-gray-700">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-soundcloud-gray-700" />
                    <DropdownMenuItem 
                      className="text-soundcloud-gray-300 hover:text-white hover:bg-soundcloud-gray-700"
                      onClick={onLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-soundcloud-gray-300 hover:text-white">
                  Sign in
                </Button>
                <Button className="bg-soundcloud-orange-500 hover:bg-soundcloud-orange-600 text-white">
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-soundcloud-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-soundcloud-gray-800">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 text-soundcloud-gray-300 hover:text-white hover:bg-soundcloud-gray-800 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}
              <Button
                onClick={onUpload}
                className="bg-soundcloud-orange-500 hover:bg-soundcloud-orange-600 text-white mt-4 sm:hidden"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 