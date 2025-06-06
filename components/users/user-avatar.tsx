"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  displayName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-lg",
};

export function UserAvatar({
  avatarUrl,
  username = "",
  displayName,
  size = "md",
  className,
}: UserAvatarProps) {
  const getInitials = () => {
    const name = displayName || username;
    if (!name) return "?";
    
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0][0]?.toUpperCase() || "?";
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={avatarUrl || undefined} 
        alt={displayName || username || "User avatar"} 
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
} 