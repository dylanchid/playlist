import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showViewAll?: boolean;
  onViewAll?: () => void;
  showNavigation?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  showViewAll = false,
  onViewAll,
  showNavigation = false,
  onPrevious,
  onNext,
  className = ""
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      {/* Left Side - Title & Subtitle */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* Navigation Controls */}
        {showNavigation && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* View All Link */}
        {showViewAll && (
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
} 