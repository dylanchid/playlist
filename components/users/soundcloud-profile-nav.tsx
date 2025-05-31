'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface SoundCloudProfileNavProps {
  defaultTab?: string
  showReposts?: boolean
  trackCount?: number
  playlistCount?: number
  albumCount?: number
  repostCount?: number
  children?: React.ReactNode
}

export const SoundCloudProfileNav: React.FC<SoundCloudProfileNavProps> = ({
  defaultTab = "all",
  showReposts = true,
  trackCount = 0,
  playlistCount = 0,
  albumCount = 0,
  repostCount = 0,
  children,
}) => {
  return (
    <div className="bg-gray-900">
      <div className="px-4 md:px-8">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="bg-transparent border-b border-gray-800 rounded-none w-full justify-start h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white hover:text-white rounded-none px-4 py-3 font-medium"
            >
              All
            </TabsTrigger>
            
            <TabsTrigger 
              value="popular" 
              className="border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white hover:text-white rounded-none px-4 py-3 font-medium"
            >
              Popular tracks
            </TabsTrigger>
            
            <TabsTrigger 
              value="tracks" 
              className="border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white hover:text-white rounded-none px-4 py-3 font-medium flex items-center gap-2"
            >
              Tracks
              {trackCount > 0 && (
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                  {trackCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="albums" 
              className="border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white hover:text-white rounded-none px-4 py-3 font-medium flex items-center gap-2"
            >
              Albums
              {albumCount > 0 && (
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                  {albumCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="playlists" 
              className="border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white hover:text-white rounded-none px-4 py-3 font-medium flex items-center gap-2"
            >
              Playlists
              {playlistCount > 0 && (
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                  {playlistCount}
                </Badge>
              )}
            </TabsTrigger>
            
            {showReposts && (
              <TabsTrigger 
                value="reposts" 
                className="border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white hover:text-white rounded-none px-4 py-3 font-medium flex items-center gap-2"
              >
                Reposts
                {repostCount > 0 && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                    {repostCount}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {children}
        </Tabs>
      </div>
    </div>
  )
} 