# Product Requirements Document (PRD)

## Above The Spread - Football Platform

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Active Development

---

## 1. Executive Summary

### 1.1 Product Vision

Above The Spread is a minimalist, data-driven football platform where elite statistics meet community passion. The platform serves as a comprehensive hub for football enthusiasts to access real-time match data, AI-generated insights, and engage in meaningful discussions.

### 1.2 Product Goals

- **Data-Driven Insights**: Provide comprehensive football statistics and real-time match data
- **AI-Powered Analysis**: Deliver automated news generation and tactical predictions
- **Community Engagement**: Enable users to share opinions, analysis, and engage in discussions
- **Performance**: Optimize for fast load times, SEO, and excellent user experience
- **Scalability**: Build a flexible architecture that can expand to additional leagues and features

### 1.3 Target Audience

- **Primary**: Football enthusiasts aged 18-45 who follow European football leagues
- **Secondary**: Casual fans seeking match predictions and insights
- **Tertiary**: Analysts and content creators looking for data and community engagement

---

## 2. Product Overview

### 2.1 Core Value Proposition

- Real-time match data and statistics from top European leagues
- AI-generated match previews and tactical analysis
- Community-driven discussions and content
- Clean, minimalist interface optimized for mobile and desktop
- Free access to comprehensive football data

### 2.2 Key Differentiators

- **The Oracle**: AI-powered match predictions and tactical analysis
- **Match Previews**: Visual team logo displays with league-themed styling
- **Tag-Based Filtering**: Advanced content organization by league, team, player, and topic
- **Real-Time Updates**: Live scores and fixture updates every 15 seconds
- **Community Features**: Like/dislike reactions and threaded comments

---

## 3. Feature Specifications

### 3.1 Home Page (`/`)

#### 3.1.1 Overview Dashboard

- **Purpose**: High-level dashboard featuring trending content
- **Components**:
  - Trending news carousel (auto-scrolling)
  - Marquee upcoming fixtures
  - Quick links to active discussions
  - Live scores widget
- **Data Sources**:
  - Latest published news (FastAPI)
  - Upcoming fixtures (Football API)
  - Recent discussions (FastAPI)
- **Update Frequency**:
  - News: 5 minutes
  - Fixtures: 1 minute for live matches, 2 hours for scheduled
  - Discussions: Real-time

#### 3.1.2 Visual Requirements

- Match preview cards with team logos and diagonal separator
- Tag badges with league-themed colors
- Responsive grid layout
- Dark/light mode support

### 3.2 Games (`/games`)

#### 3.2.1 Fixtures List

- **Purpose**: Display fixtures for selected date
- **Features**:
  - Date picker/calendar navigation
  - Filter by league
  - Group fixtures by competition
  - Display team logos, scores, and match status
  - Timezone support
- **Status Handling**:
  - Scheduled (TBD, NS): Show kickoff time
  - Live (1H, HT, 2H, ET, etc.): Show live score and elapsed time
  - Finished (FT, AET, PEN): Show final score
  - Postponed/Cancelled: Show appropriate status

#### 3.2.2 Match Detail (`/games/detail/[fixture-id]`)

- **Purpose**: Comprehensive match information and analysis
- **Tabs** (conditional based on match status):
  - **Tips**: AI-generated predictions (always visible)
  - **Odds**: Pre-match betting odds (only for scheduled matches)
  - **Statistics**: Match statistics (after match starts)
  - **Lineups**: Starting XI and substitutes (after lineups available)
  - **Events**: Goals, cards, substitutions (during/after match)
  - **Head-to-Head**: Historical matchups (always visible)
- **Data Sources**:
  - Fixture data (Football API)
  - Odds (Football API, bookmaker ID 4)
  - Statistics (Football API)
  - Predictions (Football API)

#### 3.2.3 Visual Requirements

- Team logos with league-themed backgrounds
- Real-time score updates
- Responsive card layouts
- Loading skeletons for async data

### 3.3 News (`/news`)

#### 3.3.1 News Feed

- **Purpose**: Display AI-generated and curated news articles
- **Features**:
  - Tag-based filtering (league, team, player, topic)
  - Match preview cards with team logos
  - Regular news cards with images
  - Pagination or infinite scroll
  - Published/unpublished filtering
- **Content Types**:
  - **Match Previews**: Identified by `home_team_logo` and `away_team_logo` fields
  - **General News**: Standard articles with images
  - **The Oracle**: AI-generated tactical analysis

#### 3.3.2 News Detail (`/news/[news-id]`)

- **Purpose**: Full article view with related content
- **Features**:
  - Full article content (Markdown support)
  - Tag badges with league colors
  - Related news suggestions
  - Scroll to top on navigation
  - Social sharing (future)

#### 3.3.3 Visual Requirements

- Match preview images with diagonal separator
- Tag badges with 3D liquid glass effect
- Responsive typography
- Code syntax highlighting for technical content

### 3.4 Discuss (`/discuss`)

#### 3.4.1 Discussion Forum

- **Purpose**: User-generated content and community engagement
- **Features**:
  - Create posts (authenticated users only)
  - Tag posts with leagues, teams, players, topics
  - Like/dislike reactions
  - Threaded comments
  - Tag-based filtering
  - Search functionality
- **Content Moderation**: (Future)
  - Report inappropriate content
  - Admin moderation tools

#### 3.4.2 Post Detail (`/discuss/[post-id]`)

- **Purpose**: Individual post view with expanded comments
- **Features**:
  - Full post content
  - All comments in threaded view
  - Create/edit/delete comments
  - Like/dislike on posts and comments
  - Related posts suggestions

#### 3.4.3 Visual Requirements

- Post cards with author information
- Reaction buttons with counts
- Comment threading visualization
- Tag badges consistent with news page

### 3.5 Stats (`/stats`)

#### 3.5.1 League Standings

- **Purpose**: Display league tables for all tracked competitions
- **Features**:
  - Select league from dropdown
  - Live standings updates
  - Team logos and form indicators
  - Points, goals for/against, goal difference
- **Supported Leagues**: See Section 4.1

#### 3.5.2 Top Performers

- **Purpose**: Display leading goal scorers, assist leaders, and defensive stats
- **Features**:
  - Filter by league
  - Sort by various metrics
  - Player profile links (future)

#### 3.5.3 Team Profiles (`/stats/[league-id]/team/[team-id]`)

- **Purpose**: Comprehensive team information
- **Features**:
  - Team statistics
  - Recent fixtures
  - Squad information
  - Historical performance

#### 3.5.4 Player Profiles (`/stats/player/[player-id]`)

- **Purpose**: Individual player statistics
- **Features**:
  - Season statistics
  - Career statistics
  - Recent performances

---

## 4. Technical Architecture

### 4.1 Tech Stack

#### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack React Query
- **State Management**: React Query + URL state
- **Authentication**: JWT tokens (cookies + localStorage fallback)

#### Backend

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (assumed)
- **Authentication**: Email/Password + Google OAuth
- **AI Integration**: LLM models for news generation

#### Third-Party APIs

- **Football Data**: [API-Football](https://v3.football.api-sports.io)
- **Update Frequency**: 15 seconds for live data, 3 hours for odds

### 4.2 Tracked Competitions

#### Domestic Leagues

| ID  | Competition Name | Type   |
| :-- | :--------------- | :----- |
| 39  | Premier League   | League |
| 140 | La Liga          | League |
| 135 | Serie A          | League |
| 78  | Bundesliga       | League |
| 61  | Ligue 1          | League |

#### International Cups

| ID  | Competition Name              | Type |
| :-- | :---------------------------- | :--- |
| 2   | UEFA Champions League         | Cup  |
| 3   | UEFA Europa League            | Cup  |
| 848 | UEFA Europa Conference League | Cup  |

### 4.3 File Structure

```
src/
├── app/
│   ├── (features)/          # Feature-based routing
│   │   ├── api/             # Next.js API routes (third-party proxy)
│   │   ├── games/           # Fixtures and match details
│   │   ├── discuss/         # Discussion forum
│   │   ├── news/            # News articles
│   │   └── stats/           # Statistics and standings
│   └── (auth)/              # Authentication pages
├── services/
│   ├── fastapi/             # FastAPI backend services
│   └── football-api/        # Third-party API hooks
├── type/
│   ├── fastapi/             # Backend TypeScript types
│   └── footballapi/         # Football API types
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── common/              # Shared components
└── providers/               # React providers (Query, Theme)
```

### 4.4 API Architecture

#### Third-Party API Proxying

- **Location**: `src/app/(features)/api/*/route.ts`
- **Purpose**: Control caching, reduce costs, handle rate limiting
- **Caching Strategy**:
  - Live data: 60 seconds revalidation
  - Static data: 2 hours revalidation
  - Odds: 3 hours revalidation
- **Headers**: Cache-Control with stale-while-revalidate

#### FastAPI Backend Integration

- **Location**: `src/services/fastapi/*.ts`
- **Pattern**: React Query hooks for all requests
- **Authentication**:
  - Primary: HttpOnly cookies
  - Fallback: localStorage token (Safari compatibility)
- **Error Handling**:
  - 401: Redirect to login
  - 403: User-friendly message
  - 422: Field-specific validation errors

### 4.5 Data Fetching Patterns

#### React Query Configuration

- **Stale Times**:
  - Live data (scores): 30 seconds
  - Fixtures list: 2 hours
  - News: 5 minutes
  - Odds: 3 hours
- **Refetch Intervals**: Only for live/real-time data
- **Refetch On Window Focus**: Usually `false`

#### Query Key Patterns

- Include all parameters that affect data
- Sort arrays consistently (e.g., tag IDs)
- Use descriptive, hierarchical keys

---

## 5. Design System

### 5.1 Color Palette

#### Primary Colors

- **Primary**: HSL(184, 72%, 27%) - Teal/cyan brand color
- **Background**: Light/dark mode adaptive
- **Foreground**: Text color (adaptive)
- **Card**: Card background (adaptive)
- **Muted**: Muted text/backgrounds (adaptive)
- **Destructive**: Error/danger actions (red)

#### League Theme Colors

- Stored in `src/data/league-theme.ts`
- Mapped to tag names for dynamic styling
- Used in tag badges, preview images, and UI elements

### 5.2 Typography

- **Headings**: Bold, clear hierarchy
- **Body**: Readable, appropriate line-height
- **Code**: Monospace with syntax highlighting

### 5.3 Components

#### Tag Component

- **Variants**: small, medium, large
- **Styling**: 3D liquid glass effect with backdrop-blur
- **Colors**: Dynamic based on tag name (league theme)
- **Behavior**: No text wrapping, single line display

#### Preview Image Component

- **Purpose**: Display team logos for match previews
- **Features**:
  - Diagonal slash separator
  - League-themed gradient backgrounds
  - Responsive sizing
  - Variants: default, header, carousel

#### Navigation Component

- **Tabs**: Conditional rendering based on context
- **State Management**: URL-based with optimistic updates
- **Flickering Prevention**: useRef to track user selections

### 5.4 Responsive Design

- **Mobile First**: Base styles for mobile
- **Breakpoints**: Tailwind default (sm, md, lg, xl, 2xl)
- **Touch Targets**: Minimum 44x44px
- **Layout**: Flexible grids and flexbox

### 5.5 Dark Mode

- **Implementation**: CSS variables with `.dark` selector
- **Toggle**: Theme toggle component in header
- **Persistence**: localStorage
- **Default**: System preference

---

## 6. User Experience

### 6.1 Navigation Flow

1. **Home** → Browse trending content → Click to detail pages
2. **Games** → Select date → View fixtures → Click match → View details
3. **News** → Filter by tags → Read article → Related articles
4. **Discuss** → Browse posts → Create post → Engage in comments
5. **Stats** → Select league → View standings → Drill into team/player

### 6.2 Loading States

- Skeleton loaders for async content
- Progressive loading for images
- Optimistic updates for mutations

### 6.3 Error States

- User-friendly error messages
- Retry mechanisms
- Fallback UI for failed requests
- Network error handling

### 6.4 Empty States

- Helpful messaging
- Call-to-action buttons
- Illustration placeholders (future)

---

## 7. Authentication & Authorization

### 7.1 Authentication Methods

- **Email/Password**: Traditional registration and login
- **Google OAuth**: Social authentication
- **Email Verification**: Required for new accounts
- **Password Reset**: Forgot password flow

### 7.2 Authorization Levels

- **Public**: Browse news, games, stats
- **Authenticated**: Create posts, comments, reactions
- **Admin**: (Future) Content moderation, user management

### 7.3 Token Management

- **Storage**:
  - HttpOnly cookies (primary)
  - localStorage (Safari fallback)
- **Refresh**: Automatic token refresh (future)
- **Expiration**: Handled by backend

---

## 8. Performance Requirements

### 8.1 Page Load Times

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s

### 8.2 API Response Times

- **FastAPI Backend**: < 200ms (p95)
- **Third-Party API Proxy**: < 500ms (p95)
- **Cache Hit Rate**: > 80% for static data

### 8.3 Optimization Strategies

- Next.js Image optimization
- Code splitting and lazy loading
- React Query caching
- API route caching with revalidation
- CDN for static assets

---

## 9. SEO & Accessibility

### 9.1 SEO Requirements

- **Meta Tags**: Title, description, Open Graph
- **Structured Data**: JSON-LD for articles, events
- **Sitemap**: Auto-generated
- **Robots.txt**: Properly configured

### 9.2 Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible focus states
- **Semantic HTML**: Proper heading hierarchy

---

## 10. Security Considerations

### 10.1 Data Protection

- **HTTPS**: Required for all connections
- **CORS**: Properly configured
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: SameSite cookies

### 10.2 Authentication Security

- **Password Hashing**: Backend responsibility (bcrypt)
- **Token Security**: HttpOnly cookies, secure flags
- **Rate Limiting**: Prevent brute force attacks

### 10.3 API Security

- **API Key Protection**: Environment variables only
- **Input Validation**: Both frontend and backend
- **Error Messages**: No sensitive information leakage

---

## 11. Success Metrics

### 11.1 User Engagement

- Daily Active Users (DAU)
- Page views per session
- Average session duration
- Bounce rate

### 11.2 Content Metrics

- News articles read
- Posts created
- Comments per post
- Reaction engagement rate

### 11.3 Technical Metrics

- Page load performance
- API response times
- Error rates
- Cache hit rates

---

## 12. Future Enhancements

### 12.1 Phase 2 Features

- User profiles and avatars
- Notifications system
- Email digests
- Mobile app (React Native)

### 12.2 Phase 3 Features

- Live match commentary
- Video highlights integration
- Advanced analytics dashboard
- Fantasy football integration

### 12.3 Long-Term Vision

- Expand to additional leagues (MLS, Liga MX, etc.)
- Multi-language support
- Premium subscription tier
- API access for developers

---

## 13. Environment Variables

### 13.1 Required Variables

```bash
# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Third-Party API
API_SPORTS_KEY=your_api_key
FOOTBALL_API_KEY=your_api_key  # Alternative name
FOOTBALL_API_URL=https://v3.football.api-sports.io  # Optional
```

### 13.2 Optional Variables

```bash
# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

## 14. Development Guidelines

### 14.1 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting (if configured)
- **Naming**: camelCase for variables, PascalCase for components

### 14.2 Git Workflow

- **Branches**: feature/, bugfix/, hotfix/
- **Commits**: Conventional commits format
- **PRs**: Required for main branch

### 14.3 Testing Strategy (Future)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright or Cypress

---

## 15. References

### 15.1 External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [API-Football Documentation](https://www.api-football.com/documentation-v3)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### 15.2 Internal Documentation

- Architecture patterns: See `.cursor/rules/my-frontend-rule.mdc`
- Project overview: See `.cursor/rules/project-overview.mdc`

---

## Document History

| Version | Date       | Author | Changes              |
| :------ | :--------- | :----- | :------------------- |
| 1.0     | 2025-01-12 | Team   | Initial PRD creation |

---

**Note**: This PRD is a living document and will be updated as the product evolves. For the latest technical implementation details, refer to the cursor rules in `.cursor/rules/`.
