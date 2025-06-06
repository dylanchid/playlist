# PlaylistShare Design System

## Overview
This document outlines the design patterns, components, and guidelines established by the homepage redesign that should be applied consistently across all pages.

## 🎨 Core Design Principles

### 1. Content-First Approach
- **Functional over marketing**: Prioritize actual content over promotional copy
- **Immediate value**: Users see relevant content immediately upon page load
- **Progressive disclosure**: Most important content above the fold, detailed content below

### 2. Consistent Layout Patterns
- **Container width**: `max-w-7xl mx-auto px-5` for consistent content width
- **Section spacing**: `py-8` for vertical rhythm between sections
- **Responsive grids**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

### 3. Visual Hierarchy
- **Primary headers**: `text-2xl font-bold mb-1`
- **Subtitles**: `text-muted-foreground`
- **Section headers**: `text-3xl font-bold mb-2`

## 📐 Layout Patterns

### Main Content + Sidebar (60/40 Split)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
  <div className="lg:col-span-3">{/* Main content */}</div>
  <div className="lg:col-span-2">{/* Sidebar content */}</div>
</div>
```

### Section-Based Organization
```tsx
<section className="w-full py-8">
  <div className="max-w-7xl mx-auto px-5">
    <SectionHeader title="..." subtitle="..." />
    {/* Content */}
  </div>
</section>
```

### Responsive Card Grids
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

## 🎭 Interactive Components

### Rich Card Hover Effects
```css
/* Standard card hover */
.card-hover {
  @apply hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1;
}

/* Image hover scale */
.image-hover {
  @apply group-hover:scale-105 transition-transform duration-300;
}

/* Overlay on hover */
.overlay-hover {
  @apply absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300;
}
```

### Platform Color Coding
```tsx
const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'Spotify': return 'bg-green-500'
    case 'Apple Music': return 'bg-red-500'
    case 'Custom': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}
```

### Action Button Groups
```tsx
<div className="flex items-center gap-2">
  <Button variant="ghost" size="sm">
    <Heart className="w-4 h-4 mr-1" />
    {likes}
  </Button>
  <Button variant="ghost" size="sm">
    <Share2 className="w-4 h-4" />
  </Button>
</div>
```

## 👤 User Interface Elements

### Avatar Sizing Standards
- **Small**: `h-4 w-4` - For inline elements
- **Medium**: `h-6 w-6` - For cards and lists
- **Standard**: `h-8 w-8` - For activity feeds
- **Large**: `h-9 w-9` - For profile areas

### Status Indicators
```tsx
// Live status badge
<Badge variant="outline" className="text-xs">
  <TrendingUp className="w-3 h-3 mr-1" />
  Live
</Badge>

// Platform badge
<Badge className={`${getPlatformColor(platform)} text-white border-0`}>
  {platform}
</Badge>
```

### Timestamp Formatting
```tsx
<span className="text-xs text-muted-foreground flex items-center gap-1">
  <Clock className="w-3 h-3" />
  {timestamp}
</span>
```

## 🔄 Reusable Components

### PageHeader
Standardized page headers with icons, search, and actions:
```tsx
<PageHeader
  title="Discover"
  icon={<Music className="w-6 h-6 text-white" />}
  gradient="from-purple-500 to-pink-500"
  showSearch={true}
  searchPlaceholder="Search playlists..."
  rightActions={<Button>Add Playlist</Button>}
/>
```

### SectionHeader
Consistent section headers with navigation and actions:
```tsx
<SectionHeader
  title="Trending Now"
  subtitle="What's popular on PlaylistShare"
  showViewAll={true}
  showNavigation={true}
  onPrevious={handlePrev}
  onNext={handleNext}
/>
```

### PlaylistSection
Flexible content sections with multiple layout options:
```tsx
<PlaylistSection
  title="Chill & Study Vibes"
  subtitle="Perfect for focus and relaxation"
  playlists={data}
  layout="carousel" // 'carousel' | 'grid' | 'list'
  itemsPerRow={3}
/>
```

## 🎯 Application Guidelines

### Pages to Update (Priority Order)

#### 1. Discover Page (`/discover`)
**Current State**: Basic layout with search
**Apply Patterns**:
- Replace header with `PageHeader` component
- Use `PlaylistSection` for "Trending", "New Releases", "By Genre"
- Add 60/40 layout: filters sidebar + main content
- Implement rich card hover effects

#### 2. Friends Page (`/friends`)
**Current State**: Tab-based layout
**Apply Patterns**:
- Use `PageHeader` with search functionality
- Replace activity section with enhanced `FriendActivityFeed`
- Convert to 60/40 layout: friends list + activity feed
- Apply consistent user avatar patterns

#### 3. Profile Pages (`/profile`)
**Current State**: Unknown
**Apply Patterns**:
- Use `PageHeader` for profile header
- Section-based content organization
- Rich cards for user's playlists
- Consistent avatar and metadata display

#### 4. Rankings Page (`/rankings`)
**Current State**: Unknown
**Apply Patterns**:
- Use list layout from `PlaylistSection`
- Add ranking indicators and badges
- Apply platform color coding
- Consistent metadata display

### Implementation Strategy

1. **Phase 1**: Create reusable components (`PageHeader`, `SectionHeader`)
2. **Phase 2**: Update Discover page with new patterns
3. **Phase 3**: Enhance Friends page layout
4. **Phase 4**: Apply to remaining pages
5. **Phase 5**: Polish and consistency pass

## 📱 Responsive Behavior

### Breakpoint Strategy
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grids, maintain sidebars
- **Desktop**: Full layout with sidebars and multi-column grids

### Touch Interactions
- Larger touch targets on mobile (`min-h-12`)
- Swipe-friendly carousels
- Bottom-aligned action buttons on mobile

## 🎨 Color & Typography

### Platform Colors
- **Spotify**: `bg-green-500`
- **Apple Music**: `bg-red-500`
- **Custom**: `bg-purple-500`
- **YouTube Music**: `bg-red-600`
- **SoundCloud**: `bg-orange-500`

### Action Colors
- **Like/Heart**: `text-red-500`
- **Share**: `text-blue-500`
- **Play**: `text-green-500`
- **Comment**: `text-purple-500`

### Typography Scale
- **Page Title**: `text-2xl font-bold`
- **Section Title**: `text-2xl font-bold mb-1`
- **Card Title**: `font-semibold text-sm`
- **Metadata**: `text-xs text-muted-foreground`
- **Body**: `text-sm`

This design system ensures consistent, engaging user experiences across all pages while maintaining the high-quality visual standards established by the homepage redesign. 