# Codebase Documentation

## Project Overview
- **Project Name**: PlaylistShare
- **Version**: 2.0 (Active Development)
- **Description**: A social music discovery platform built around trusted friend recommendations, where every playlist comes with personal context and musical connections transcend streaming platform boundaries.
- **Main Purpose/Goal**: To solve music discovery fatigue by connecting friends through curated playlists with personal stories, creating meaningful musical relationships that algorithms can't replicate.
- **Target Audience**: Music enthusiasts (ages 22-35) who actively curate playlists and seek authentic music discovery through friend recommendations
- **License**: Not specified

## Architecture & Structure

### High-Level Architecture
- **Architecture Pattern**: Modern Next.js App Router with API Routes, full-stack TypeScript application
- **Design Principles**: Component-based architecture, type safety with TypeScript, real-time capabilities with Supabase
- **Key Architectural Decisions**: 
  - Supabase as backend-as-a-service for authentication, database, and real-time features
  - React Query for server state management and caching
  - Context API for authentication state
  - Modular component structure with shadcn/ui

### Directory Structure
```
playlist-nextjs/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── auth/              # Authentication pages (login, signup, etc.)
│   ├── demo/              # Demo/testing pages
│   ├── discover/          # Music discovery interface
│   ├── friends/           # Friend management and social features
│   ├── profile/           # User profile management
│   ├── protected/         # Protected routes requiring authentication
│   └── rankings/          # Playlist rankings and charts
├── components/            # Reusable React components
│   ├── auth/              # Authentication-related components
│   ├── common/            # Shared/common components
│   ├── layout/            # Layout components
│   ├── navigation/        # Navigation components
│   ├── playlists/         # Playlist-specific components
│   ├── profile/           # Profile-related components
│   └── ui/                # Base UI components (shadcn/ui)
├── contexts/              # React contexts for global state
├── docs/                  # Project documentation
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
│   └── supabase/          # Supabase client and utilities
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### Core Components
- **Authentication System**: Complete user auth with Supabase, context-based state management
- **Playlist Management**: CRUD operations for playlists with context stories (core feature)
- **Social Features**: Friend connections, playlist sharing, activity feeds
- **Music Platform Integration**: Support for Spotify, Apple Music, and custom playlists
- **Real-time Updates**: Live notifications and activity feeds via Supabase

### Data Flow
- **Input Sources**: User authentication, playlist creation, music platform APIs, social interactions
- **Processing Pipeline**: Next.js API routes → Supabase database → React Query cache → UI components
- **Output Destinations**: Database persistence, real-time updates, external music platforms

## Technology Stack

### Primary Technologies
- **Programming Language(s)**: TypeScript, JavaScript
- **Framework(s)**: Next.js 15 (App Router), React 19
- **Database(s)**: Supabase (PostgreSQL)
- **Runtime Environment**: Node.js, Browser

### Dependencies
- **Core Dependencies**: 
  - `@supabase/supabase-js` & `@supabase/ssr` - Database and authentication
  - `@tanstack/react-query` - Server state management and caching
  - `@radix-ui/*` - Accessible UI primitives
  - `react-hook-form` & `zod` - Form handling and validation
  - `tailwindcss` - Utility-first CSS framework
  - `next-themes` - Dark/light mode support
  - `lucide-react` - Icon library
- **Development Dependencies**: 
  - `typescript` - Type checking
  - `eslint` - Code linting with Next.js config
  - `tailwindcss-animate` - Animation utilities
- **Version Requirements**: React 19, Next.js latest, Node.js compatible

### Infrastructure
- **Deployment Platform**: Vercel (configured for one-click deployment)
- **CI/CD**: Vercel's built-in deployment pipeline
- **Monitoring/Logging**: Built-in console logging, Supabase monitoring
- **External Services**: Spotify API, Apple Music API, Supabase backend

## Key Features & Functionality

### Core Features
1. **User Authentication & Profiles**: Complete auth system with profile management, music preferences, platform connections
   - Entry points: `app/auth/`, `contexts/auth-context.tsx`
   - Key files: `lib/supabase/client.ts`, `components/auth/`

2. **Playlist Management with Context Stories**: Create, edit, share playlists with required personal context (core differentiator)
   - Entry points: `app/api/playlists/`, `components/playlists/`
   - Key files: `types/playlist.ts`, `types/database.ts`

3. **Social Friend Network**: Connect with friends, view compatibility scores, follow/unfollow
   - Entry points: `app/friends/`, `components/users/`
   - Key files: Database schema for `user_follows`, `friend_activities`

4. **Music Discovery Feed**: Personalized feed of friend playlist shares with engagement features
   - Entry points: `app/discover/`, `app/friends/`
   - Key files: Real-time subscriptions, activity tracking

5. **Cross-Platform Integration**: Support for Spotify, Apple Music, and custom playlists
   - Entry points: `types/spotify.ts`, platform-specific API integration
   - Key files: External ID tracking, URL linking

### API Endpoints (if applicable)
- **Authentication**: Supabase Auth APIs via `/app/auth/` routes
- **Core Endpoints**: 
  - `/api/playlists` - CRUD operations for playlists
  - `/api/playlists/[id]/like` - Playlist engagement
  - `/api/playlists/infinite` - Infinite scroll pagination
- **Data Formats**: JSON with TypeScript interfaces, Supabase Row/Insert/Update types

## Code Organization

### Entry Points
- **Main Application**: `app/layout.tsx` - Root layout with providers
- **Home Page**: `app/page.tsx` - Landing/dashboard page
- **Scripts**: `package.json` scripts for dev, build, start, lint

### Module/Package Structure
- **Core Modules**: `app/` pages, `components/` UI, `lib/` utilities
- **Utility Modules**: `utils/`, `hooks/`, `types/`
- **Configuration Modules**: `lib/supabase/`, `contexts/`
- **Test Modules**: None currently implemented

### Naming Conventions
- **Files**: kebab-case (e.g., `auth-context.tsx`, `user-profile.tsx`)
- **Classes**: PascalCase (standard React components)
- **Functions**: camelCase (e.g., `createClient`, `getOrCreateUserProfile`)
- **Variables**: camelCase with descriptive names (e.g., `isLoading`, `profileCompleted`)
- **Constants**: UPPERCASE for environment variables, camelCase for regular constants

## Development Information

### Development Setup
- **Prerequisites**: Node.js 18+, npm/yarn/pnpm, Supabase account
- **Installation Steps**: 
  1. Clone repository
  2. Install dependencies: `npm install`
  3. Set up Supabase project and get credentials
  4. Copy `.env.example` to `.env.local` and fill in Supabase credentials
  5. Run development server: `npm run dev`
- **Environment Configuration**: 
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- **Database Setup**: Supabase provides hosted PostgreSQL with schema migration support

### Build Process
- **Build Commands**: `npm run build` (Next.js production build)
- **Build Artifacts**: `.next/` folder with optimized static files and server routes
- **Build Configuration**: `next.config.ts` with CORS headers and API rewrites

### Testing Strategy
- **Testing Framework**: None currently implemented
- **Test Types**: No tests currently present
- **Test Coverage**: 0% - needs implementation
- **Test Execution**: Testing infrastructure needs to be set up

## Configuration & Environment

### Configuration Files
- **Main Config**: `next.config.ts` - Next.js configuration with CORS and rewrites
- **Environment-Specific**: `.env.local` for development, Vercel for production
- **Secrets Management**: Environment variables, Supabase handles database credentials

### Environment Variables
- **Required Variables**: 
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public API key
- **Optional Variables**: None currently defined
- **Default Values**: Localhost development server on port 3001

## Data Models & Schemas

### Database Schema (Supabase PostgreSQL)
- **Tables/Collections**: 
  - `user_profiles` - User data, preferences, platform tokens
  - `playlists` - Playlist metadata with required context stories
  - `playlist_tracks` - Individual tracks within playlists
  - `playlist_likes` - User engagement with playlists
  - `user_follows` - Friend connections with compatibility scores
  - `playlist_plays` - Analytics tracking
  - `playlist_shares` - Sharing activity between users
  - `friend_activities` - Social activity feed data
- **Relationships**: User → Playlists (1:many), Users ↔ Users (many:many follows), Playlists ↔ Users (many:many likes)
- **Indexes**: Primary keys, foreign key constraints
- **Migrations**: Schema management via Supabase dashboard

### Data Structures
- **Core Data Types**: Defined in `types/database.ts` with Supabase-generated interfaces
- **Input/Output Formats**: TypeScript interfaces for forms, API responses, database operations
- **Validation Rules**: Zod schemas for form validation, database constraints

## Security Considerations

### Authentication & Authorization
- **Auth Method**: Supabase Auth with email/password, OAuth providers supported
- **User Roles**: Standard users (no admin roles currently implemented)
- **Permission System**: Row Level Security (RLS) policies in Supabase

### Security Measures
- **Input Validation**: Zod schemas, form validation, React Hook Form integration
- **Data Protection**: Supabase handles encryption, HTTPS for all connections
- **Vulnerability Mitigation**: CORS configuration, Supabase built-in security features

## Performance & Scalability

### Performance Characteristics
- **Expected Load**: Small to medium user base initially (PRD targets 45M potential users)
- **Bottlenecks**: Database queries, external music API rate limits
- **Optimization**: React Query caching, Supabase edge functions, Next.js optimization

### Scalability Considerations
- **Horizontal Scaling**: Supabase handles database scaling automatically
- **Vertical Scaling**: Vercel serverless functions scale automatically
- **Resource Requirements**: Minimal server resources due to serverless architecture

## Error Handling & Logging

### Error Handling Strategy
- **Error Types**: Authentication errors, database errors, API errors, network errors
- **Error Propagation**: React error boundaries, promise rejection handling
- **User Error Handling**: Toast notifications via Sonner, form validation errors

### Logging
- **Log Levels**: Console logging with categorized prefixes (🔌, 🏗️, ❌, ✅)
- **Log Destinations**: Browser console, Vercel function logs
- **Log Format**: Structured logging with emojis for easy identification

## Deployment & Operations

### Deployment Process
- **Deployment Method**: Vercel Git integration with automatic deployments
- **Environment Promotion**: Branch-based deployments (main → production)
- **Rollback Strategy**: Vercel deployment history and instant rollbacks

### Monitoring & Maintenance
- **Health Checks**: Built-in Vercel monitoring
- **Metrics**: Vercel analytics, Supabase dashboard metrics
- **Alerting**: Vercel and Supabase built-in alerting

## Documentation & Resources

### Code Documentation
- **Inline Comments**: Extensive JSDoc comments and inline explanations
- **API Documentation**: TypeScript interfaces serve as API documentation
- **Architecture Diagrams**: Available in `/docs` folder

### External Resources
- **Design Documents**: Complete PRD in `docs/PRD.md` with user journeys and features
- **Requirements**: Technical specifications in `docs/TECHNICAL_SPECS.md`
- **User Manuals**: Setup guide in `SETUP_GUIDE.md`

## Known Issues & Limitations

### Current Issues
- **Bug Reports**: Auth state management complexity, CORS configuration issues (partially resolved)
- **Technical Debt**: No testing infrastructure, need for better error boundaries
- **Performance Issues**: No performance monitoring implemented yet

### Limitations
- **Feature Limitations**: No testing framework, limited admin functionality
- **Scalability Limits**: Depends on Supabase and Vercel limits
- **Platform Constraints**: Music platform API rate limits and access restrictions

## Development Guidelines

### Code Style
- **Style Guide**: Follows Next.js and React best practices, TypeScript strict mode
- **Formatting**: ESLint with Next.js configuration
- **Code Review Process**: No formal process currently (needs implementation)

### Contribution Guidelines
- **Branching Strategy**: Not formally defined (needs implementation)
- **Commit Message Format**: Not formally defined (needs implementation)
- **Pull Request Process**: Not formally defined (needs implementation)

## Troubleshooting

### Common Issues
- **Auth Issues**: Clear auth storage with `clearAuthStorage()` debug function
- **CORS Issues**: Next.js config includes CORS headers, Supabase client has cleanup logic
- **Database Issues**: Check Supabase dashboard, use `setup-database.js` for diagnostics

### Debugging
- **Debug Tools**: Browser debug functions (`debugAuthState()`, `clearAuthStorage()`)
- **Debug Process**: Console logging with categorized prefixes, React Query DevTools
- **Log Analysis**: Browser console and Vercel function logs

## Development Backlog & Roadmap

### **CRITICAL PRIORITY (Immediate - Days 1-10)**
*Based on PRD alignment analysis from `docs/DEVELOPMENT_PLAN.md`*

#### **🚨 Core Product Features (PRD Alignment)**
1. **Context-Required Sharing Implementation** - *CRITICAL*
   - Database schema update: Add `context_story` column to playlists table
   - UI enforcement: Cannot share without context (10+ character minimum)
   - Files: `types/database.ts`, `components/playlists/share-modal.tsx`
   - Success criteria: 100% context completion for shares

2. **Enhanced Social Features** - *HIGH*
   - Friend compatibility scoring algorithm
   - Reaction system (🔥 🎯 💭 🚀) replacing basic likes
   - Friend activity feed with contextual shares
   - Files: `app/api/friends/`, `components/social/`

3. **Music Discovery Enhancement** - *HIGH*
   - "Because [Friend] likes..." recommendation engine
   - Smart friend suggestions based on music overlap
   - Compatibility visualization in friend lists
   - Files: `lib/recommendations/`, `components/discovery/`

### **HIGH PRIORITY (Weeks 2-4)**

#### **🧪 Testing Infrastructure**
4. **Comprehensive Testing Framework** - *HIGH*
   - **Jest + React Testing Library setup**
   - Component testing for all UI components
   - Integration testing for API routes
   - E2E testing for critical user flows (auth, playlist sharing)
   - Files to create:
     - `jest.config.js`
     - `setupTests.ts`
     - `__tests__/` directories throughout
     - `.github/workflows/test.yml` for CI
   - Target: 80%+ test coverage

5. **Error Boundaries & Resilience** - *HIGH*
   - React Error Boundaries for component failures
   - Global error handling strategy
   - Graceful degradation for network issues
   - Better error messaging and recovery flows
   - Files: `components/error-boundary.tsx`, `lib/error-handling.ts`

#### **📊 Performance & Monitoring**
6. **Performance Monitoring & Analytics** - *HIGH*
   - **Web Vitals tracking** (Core Web Vitals, LCP, FID, CLS)
   - User behavior analytics (playlist creation, sharing patterns)
   - Real-time performance monitoring with Sentry or similar
   - Database query performance monitoring
   - Files to create:
     - `lib/analytics.ts`
     - `lib/performance.ts`
     - Performance dashboard components
   - Tools: Vercel Analytics, Sentry, Custom metrics

### **MEDIUM PRIORITY (Weeks 5-8)**

#### **⚙️ Development Process & Workflows**
7. **Formal Development Workflows** - *MEDIUM*
   - **Git branching strategy** (GitFlow or GitHub Flow)
   - **Pull Request templates** with checklist
   - **Code review guidelines** and approval process
   - **Commit message conventions** (Conventional Commits)
   - Files to create:
     - `.github/pull_request_template.md`
     - `CONTRIBUTING.md`
     - `.github/workflows/` for CI/CD
     - Branch protection rules documentation

8. **API Documentation Generation** - *MEDIUM*
   - **TypeScript interface documentation** with TSDoc
   - **OpenAPI/Swagger** generation from API routes
   - **Interactive API explorer** for development
   - **Supabase RPC documentation**
   - Tools: TypeDoc, swagger-jsdoc, swagger-ui-express
   - Files: `docs/api/`, automated doc generation scripts

#### **🏗️ Technical Infrastructure**
9. **Database Performance Optimization** - *MEDIUM*
   - Query optimization and indexing strategy
   - Database connection pooling
   - Caching layer implementation (Redis)
   - Database migration management system
   - Files: `lib/database/`, migration scripts

10. **Security Enhancements** - *MEDIUM*
    - Comprehensive security audit
    - Rate limiting implementation
    - Input sanitization improvements
    - OWASP compliance review
    - Files: `middleware/security.ts`, security policies

### **LOWER PRIORITY (Weeks 9-16)**

#### **📱 Platform Expansion**
11. **Mobile App Development** - *MEDIUM*
    - React Native or Progressive Web App
    - Mobile-specific playlist sharing flows
    - Push notifications for friend activity
    - Offline playlist caching

12. **Advanced Features** - *MEDIUM*
    - Mood-based playlist categorization
    - Cross-platform playlist synchronization
    - Advanced search with context filtering
    - Music platform API integrations (Spotify, Apple Music)

#### **💰 Monetization Preparation**
13. **Premium Features Foundation** - *LOW*
    - Subscription management system
    - Feature gating infrastructure
    - Payment processing integration
    - Creator monetization tools

### **ONGOING MAINTENANCE**

#### **🔧 Technical Debt Resolution**
- Remove mock data dependencies
- Improve TypeScript type coverage
- Optimize bundle size and performance
- Standardize component APIs
- Update dependencies and security patches

#### **📚 Documentation Maintenance**
- Keep codebase documentation current
- Maintain API documentation
- Update setup and deployment guides
- Create video tutorials for complex workflows

### **SUCCESS METRICS BY PHASE**

#### **Phase 1 (Critical - Days 1-10)**
- ✅ Context required for all playlist shares (100% enforcement)
- ✅ Friend compatibility scores visible in UI
- ✅ Reaction system replacing basic likes
- ✅ Activity feed showing contextual friend activity

#### **Phase 2 (High Priority - Weeks 2-4)**
- ✅ 80%+ test coverage achieved
- ✅ Error boundaries preventing app crashes
- ✅ Performance monitoring dashboard active
- ✅ Real-time analytics collecting user behavior

#### **Phase 3 (Medium Priority - Weeks 5-8)**
- ✅ Formal PR process with 100% review compliance
- ✅ Auto-generated API documentation
- ✅ Database queries optimized (< 100ms avg response)
- ✅ Security audit completed with no critical issues

### **Resource Allocation Recommendations**
- **40%** - Core PRD alignment features (Critical Priority)
- **30%** - Testing and monitoring infrastructure (High Priority)
- **20%** - Development process improvements (Medium Priority)
- **10%** - Future platform expansion (Lower Priority)

### **Dependencies & Blockers**
- Context-required sharing blocks social engagement features
- Testing framework needed before major feature development
- Performance monitoring required before user base growth
- API documentation needed for potential integrations

This backlog reflects both the immediate product needs identified in the PRD analysis and the technical infrastructure improvements requested. The prioritization ensures that product-market fit features are delivered first, followed by the foundation needed for sustainable development and growth.

---

## Quick Reference

### Important Commands
```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build production version
npm run start           # Start production server
npm run lint            # Run ESLint

# Database Setup
node setup-database.js  # Check database configuration
```

### Key Files & Directories
- `app/layout.tsx` - Main application layout and providers
- `lib/supabase/client.ts` - Supabase client configuration
- `contexts/auth-context.tsx` - Authentication state management
- `types/database.ts` - Database schema and type definitions
- `docs/PRD.md` - Product requirements and feature specifications

### Contact Information
- **Project Lead**: Not specified
- **Development Team**: Not specified
- **Documentation Maintainer**: Auto-generated from codebase analysis

---

*Last Updated: 2025-06-06*
