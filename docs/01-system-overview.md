# System Overview — Above The Spread Frontend

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + CSS variables |
| UI primitives | shadcn/ui (Radix UI) |
| Data fetching | TanStack React Query 5 |
| Form validation | Zod 4 |
| Auth | HttpOnly cookies + localStorage fallback |
| Analytics | Plausible (next-plausible) |
| Dark mode | next-themes |
| Notifications | react-toastify |
| Markdown | react-markdown + remark-gfm |
| Images | Cloudinary (uploads), Next.js Image (optimization) |

---

## Routing

The App Router is organized into two route groups:

```
src/app/
├── (auth)/          # No main nav — login, register, forgot-pwd, reset-pwd, email-verify
└── (features)/      # Main nav + footer — all user-facing pages
    ├── (home)/      # Home page ( / )
    ├── games/       # Fixtures list, match detail
    ├── news/        # News feed, article detail
    ├── discuss/     # Forum, post detail, group pages
    ├── stats/       # Standings, team, player profiles
    ├── world-cup/   # Tournament hub
    ├── profile/     # User profiles
    └── api/         # Next.js API routes (third-party proxy)
```

There is also a `(test)/` group with development test pages for fixtures, odds, voting, and timezone detection. These are not linked from the main navigation.

---

## Data Sources & API Architecture

### Two distinct backends

**1. FastAPI backend** — handles all user data

- Base URL: `NEXT_PUBLIC_BACKEND_URL` (e.g. `http://localhost:8000`)
- Service files: `src/services/fastapi/*.ts`
- All requests use React Query hooks
- Credentials sent via `credentials: "include"` (cookies) plus an `Authorization: Bearer` header for Safari

**2. API-Football (api-sports.io)** — handles all football data

- Not called directly from the browser
- Proxied through Next.js API routes at `src/app/(features)/api/*/route.ts`
- API key stored server-side in `API_SPORTS_KEY`
- Client hooks live in `src/services/football-api/*.ts`

### Why the proxy layer?

The Next.js API routes serve as a caching and cost-control layer:

- Responses are cached with `next: { revalidate: N }` so the external API is not hammered on every page load
- The API key never reaches the browser
- Rate limits (100 req/day on the free tier) are managed centrally

Revalidation intervals by data type:

| Data type | Revalidate |
|---|---|
| Live scores / fixture events | 60 s |
| Fixture lists, standings, stats | ~2 h |
| Odds | 3 h |
| Leagues, team info, squads | 2 h |

---

## State Management

There is no Redux or global store. State is handled by two mechanisms:

**React Query** — owns all server-derived state. Every API call is wrapped in a `useQuery` or `useMutation` hook. Query invalidation on mutations keeps the cache consistent.

**URL params** — own UI state that should survive navigation (selected date, active page, tag filters, selected tab). This makes URLs shareable and back/forward navigation work correctly.

### Query key conventions

Keys are hierarchical arrays of all parameters that affect the response:

```typescript
['currentUser']
['fixtures-by-date', '2025-04-15', 'Europe/London']
['news', page, pageSize, [39, 140]]   // tag IDs sorted ascending
['posts', groupId, page, pageSize]
```

### Stale time strategy

```typescript
// Live data — short stale time, some with refetchInterval
staleTime: 30_000        // 30 s — live scores

// Semi-dynamic
staleTime: 5 * 60_000    // 5 min — news, posts

// Slow-changing
staleTime: 2 * 3600_000  // 2 h — fixtures, standings

// Very static
staleTime: 3 * 3600_000  // 3 h — odds, historical data
```

---

## Authentication

### Storage

- **Primary**: HttpOnly cookies set by FastAPI on login
- **Fallback**: `localStorage` token sent as `Authorization: Bearer` header
- The fallback exists because Safari blocks cross-site cookies by default

### Token utilities (`src/services/fastapi/token-storage.ts`)

```typescript
storeToken(token)   // save to localStorage
getStoredToken()    // read from localStorage
clearStoredToken()  // remove on logout
getAuthHeader()     // returns "Bearer {token}" or ""
```

### Auth flow

```
User logs in → FastAPI sets HttpOnly cookie + returns JWT
→ Frontend stores JWT in localStorage
→ All subsequent requests: credentials: "include" + Authorization header
→ Logout: clearStoredToken() + queryClient.clear() + cookie cleared by backend
```

### Service hooks (`src/services/fastapi/oauth.ts`)

- `useCurrentUser()` — React Query hook, queries `/api/auth/me`
- `useLogout()` — mutation that clears storage and cache

---

## Directory Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth route group
│   ├── (features)/
│   │   ├── api/                   # Third-party API proxy routes
│   │   │   ├── fixture-by-date/route.ts
│   │   │   ├── fixture-by-id/route.ts
│   │   │   ├── fixture-live/route.ts
│   │   │   ├── fixture-events/route.ts
│   │   │   ├── fixture-statistics/route.ts
│   │   │   ├── fixture-players/route.ts
│   │   │   ├── lineups/route.ts
│   │   │   ├── standings/route.ts
│   │   │   ├── leaders/route.ts
│   │   │   ├── odds/route.ts
│   │   │   ├── predictions/route.ts
│   │   │   ├── headtohead/route.ts
│   │   │   ├── team-statistics/route.ts
│   │   │   ├── player-statistics/route.ts
│   │   │   └── ...
│   │   ├── (home)/page.tsx
│   │   ├── games/
│   │   │   ├── page.tsx           # Fixture list with date picker
│   │   │   └── detail/page.tsx    # Match detail (tabs: tips, odds, stats, lineups, events, h2h)
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [new-id]/page.tsx
│   │   ├── discuss/
│   │   │   ├── page.tsx
│   │   │   ├── [post-id]/page.tsx
│   │   │   ├── fixture/[fixture-id]/page.tsx
│   │   │   ├── group-posts/[group-id]/page.tsx
│   │   │   ├── create-group/page.tsx
│   │   │   ├── _components/
│   │   │   └── _contexts/
│   │   ├── stats/
│   │   │   ├── page.tsx
│   │   │   ├── [league-id]/page.tsx
│   │   │   ├── [league-id]/[team-id]/page.tsx
│   │   │   └── player/[player-id]/page.tsx
│   │   ├── world-cup/
│   │   └── profile/
│   └── (test)/
├── services/
│   ├── fastapi/                   # React Query hooks for FastAPI
│   │   ├── oauth.ts
│   │   ├── user.ts
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   ├── groups.ts
│   │   ├── news.ts
│   │   ├── vote.ts
│   │   ├── predictions.ts
│   │   ├── notification.ts
│   │   └── token-storage.ts
│   └── football-api/              # React Query hooks for proxied API
│       ├── fixtures.ts
│       ├── fixture-statistics.ts
│       ├── fixture-events.ts
│       ├── fixture-lineups.ts
│       ├── fixture-players-statistics.ts
│       ├── odds.ts
│       └── world-cup-*.ts
├── components/
│   ├── ui/                        # shadcn/ui base components
│   ├── common/                    # App-specific shared components
│   └── layout/                    # Header, nav, footer
├── type/
│   ├── fastapi/                   # Types matching FastAPI Pydantic schemas
│   └── footballapi/               # Types matching API-Football responses
├── lib/
│   ├── utils.ts                   # cn() helper
│   ├── news-content.ts            # Parse JSON news structure
│   ├── cloudinary.ts              # Image URL helpers
│   ├── voter-id.ts                # Anonymous voter ID
│   ├── vote-bar-segments.ts       # Vote percentage visualization
│   └── validations/auth.ts        # Zod schemas for auth forms
├── hooks/
│   ├── use-mobile.ts              # Detects < 768px viewport
│   └── use-user-timezone.ts       # User's local timezone
├── data/
│   ├── league-ids.ts              # League ID constants
│   ├── league-theme.ts            # League → color mappings
│   ├── fixture-status.ts          # Status code labels and styling
│   └── nav.ts                     # Navigation structure
├── config/
│   └── season-config.ts           # Season IDs per league per year
└── providers/
    ├── query-client.tsx
    └── theme-provider.tsx
```

---

## Key Entities & Types

### User (`src/type/fastapi/user.d.ts`)
```typescript
{
  id: number
  username: string
  email: string
  email_verified: boolean
  avatar_url: string | null
  is_active: boolean
  created_at: string
}
```

### Post (`src/type/fastapi/posts.d.ts`)
```typescript
{
  id: number
  content: string
  image_url: string | null
  author: { id, username, avatar_url }
  group_id?: number | null
  group_type?: "user" | "fixture"
  created_at: string
  likes: number
  dislikes: number
  comment_count: number
  tags: Tag[]
  user_reaction: boolean | null   // true = liked, false = disliked
}
```

### Group (`src/type/fastapi/groups.d.ts`)
```typescript
{
  id: number
  name: string
  group_type: "user" | "fixture"
  is_private: boolean
  owner_id: number
  member_count: number
  fixture_meta?: {                 // only for fixture-type groups
    api_fixture_id: number
    home_team: string
    away_team: string
    match_date: string
    status: string
  }
  tags: Tag[]
}
```

### Fixture (from API-Football, `src/type/footballapi/fixture.d.ts`)
```typescript
{
  fixture: { id, date, status: { long, short, elapsed }, venue }
  league:  { id, name, country, logo, season, round }
  teams:   { home: { id, name, logo, winner }, away: { ... } }
  goals:   { home: number, away: number }
  score:   { halftime, fulltime, extratime, penalty }
}
```

### Vote (`src/type/fastapi/vote.d.ts`)
```typescript
{
  fixture_id: number
  vote_choice: "home" | "away" | "draw"
  home_votes: number
  away_votes: number
  draw_votes: number
  home_percentage: number
  away_percentage: number
  draw_percentage: number
  user_vote: VoteChoice | null
}
```

### Prediction stats / leaderboard (`src/type/fastapi/predictions.d.ts`)
```typescript
{
  user_id: number
  username: string
  total_predictions: number
  correct_predictions: number
  prediction_accuracy: number
  current_streak: number
  rank: number
}
```

---

## Component Organization

### Layout (`src/components/layout/`)

| File | Purpose |
|---|---|
| `header.tsx` | Top bar: logo, theme toggle, notifications, user menu |
| `nav.tsx` | Main navigation (Home, Games, News, Discuss, Stats) |
| `mobile-nax.tsx` | Bottom navigation for mobile |
| `footer.tsx` | Footer links |
| `conditional-footer.tsx` | Hides footer on certain pages |

### Common (`src/components/common/`)

| File | Purpose |
|---|---|
| `tag.tsx` | League/topic badge with dynamic league color |
| `user-icon.tsx` | Avatar + username display |
| `theme-toggle.tsx` | Dark/light mode toggle |
| `notification.tsx` | Notification bell dropdown |
| `vote-today-popup.tsx` | Auto-popup for daily vote |
| `ask-login.tsx` | Prompt shown for protected actions |
| `loading.tsx` | Spinner |
| `no-data.tsx` | Empty state |
| `popup.tsx` | Confirmation dialog |

### UI (`src/components/ui/`)

shadcn/ui components: `button`, `card`, `input`, `dialog`, `dropdown-menu`, `select`, `table`, `pagination`, `accordion`, `carousel`, `avatar`, `skeleton`, `switch`, `textarea`, `scroll-area`.

---

## Styling

### Approach

Tailwind CSS with CSS custom properties. Colors are defined as HSL values in `src/app/globals.css` under `:root` and `.dark`, then referenced through Tailwind config. This makes dark mode a single class toggle with no runtime overhead.

### Key CSS variables

```css
--primary: 220 51% 18%          /* dark navy (brand) */
--background: 0 0% 97%          /* page background */
--foreground: 0 0% 6.5%         /* body text */
--card: 0 0% 100%               /* card surface */
--vote-blue: 224 78% 40%        /* home vote bar */
--vote-red: 0 60% 55%           /* away vote bar */
--vote-yellow: 50 85% 50%       /* draw vote bar */
--heart: 0 61% 58%              /* like reaction */
```

### League theme colors

`src/data/league-theme.ts` maps league and team names to gradient/color values. These are applied to `Tag` badges and match preview card backgrounds to give each competition a distinct identity.

### Responsive design

Mobile-first. Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). The `useMobile()` hook returns `true` below 768px and is used to switch between mobile bottom nav and desktop top nav.

---

## Image Handling

Images are served through `next/image`. Allowed remote domains (configured in `next.config.ts`):

- `media.api-sports.io` — team and player logos
- `lh3.googleusercontent.com` — Google OAuth avatars
- `res.cloudinary.com` — user-uploaded avatars and post images
- `i.pravatar.cc` — placeholder avatars
- `images.unsplash.com` — stock photos
- `api.dicebear.com` — generated avatars

User avatar uploads go to Cloudinary via the backend. Optimized URLs are generated client-side using helpers in `src/lib/cloudinary.ts`.

---

## Performance Considerations

- Third-party API calls are server-cached via `next.revalidate` — most users never trigger an upstream request
- React Query client-side cache prevents redundant fetches within a session
- `next/image` generates srcsets and uses WebP where supported
- Tailwind's JIT compiler purges all unused utility classes from the production bundle
- shadcn/ui components are individually imported — no full component library bundle

---

## Adding New Features

**New page**

1. Create `src/app/(features)/[feature]/page.tsx`
2. Add types in `src/type/fastapi/[resource].d.ts`
3. Add service + React Query hooks in `src/services/fastapi/[resource].ts`
4. Build components in the feature folder and/or `src/components/`
5. Link from `src/data/nav.ts` if top-level

**New third-party data**

1. Create `src/app/(features)/api/[endpoint]/route.ts` with `fetch()` + `next: { revalidate: N }`
2. Add corresponding React Query hook in `src/services/football-api/`
3. Add TypeScript types in `src/type/footballapi/[resource].d.ts`

**New league**

1. Add the league ID under its season in `src/config/season-config.ts` (`LEAGUE_IDS` is derived from it — do not edit `src/data/league-ids.ts`)
2. Add a theme entry in `src/data/league-theme.ts`
3. Mirror the same `SEASON_CONFIG` change in `ats-backend/app/core/leagues.py` and `ats-news/app/services/league_constants.py` (see the KEEP IN SYNC header in each file)
