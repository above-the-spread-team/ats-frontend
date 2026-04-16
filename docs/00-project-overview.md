# Project Overview — Above The Spread

## What is it?

Above The Spread is a web platform for European football fans. It combines real-time match data, AI-generated analysis, and community features into a single clean interface. Users can follow live scores and fixtures, read and discuss match previews, vote on outcomes, and compete on a prediction leaderboard.

The frontend is a Next.js 15 application that communicates with two backends:

1. A **FastAPI backend** (user accounts, posts, comments, voting, leaderboard)
2. The **API-Football third-party API** (fixtures, standings, statistics, odds, predictions), proxied through Next.js API routes

---

## Core Features

### Games (`/games`)
Browse fixtures by date with timezone support. Live matches are highlighted with a pulsing border and auto-updating scores. Clicking a match opens a detail view with tabs for AI tips, betting odds (pre-match), statistics, lineups, match events, and head-to-head history.

### News (`/news`)
Articles created by the backend, including AI-generated match previews ("The Oracle") and general editorial content. Filterable by tag (league, team, topic). Each article has a threaded comment section.

### Discuss (`/discuss`)
A forum where authenticated users can create posts, tag them by league or topic, attach images, and assign them to groups. Posts and comments support like/dislike reactions. Two types of groups exist: user-created groups and fixture-linked groups that are automatically created for each match.

### Stats (`/stats`)
League standings, top scorers, assist leaders, and team/player profile pages. Covers the five major European domestic leagues and three UEFA competitions.

### Prediction Voting
On the home page, users vote on today's featured match (home / draw / away). Results are displayed as a percentage bar. Votes are tracked anonymously and per-user when logged in.

### Prediction Leaderboard (`/`)
Logged-in users accumulate prediction accuracy scores over time. The home page shows the top 5. A full leaderboard page is public.

### World Cup (`/world-cup`)
A standalone section for tournament fixtures, group standings, team pages, and a user prediction contest where users pick group winners and the champion before a deadline.

### User Profiles (`/profile`)
Each user has a public profile showing their stats (prediction accuracy, post count, group memberships, leaderboard rank) and recent activity.

---

## Tracked Competitions

| ID  | Competition                   | Type   |
|-----|-------------------------------|--------|
| 39  | Premier League                | League |
| 140 | La Liga                       | League |
| 135 | Serie A                       | League |
| 78  | Bundesliga                    | League |
| 61  | Ligue 1                       | League |
| 2   | UEFA Champions League         | Cup    |
| 3   | UEFA Europa League            | Cup    |
| 848 | UEFA Europa Conference League | Cup    |

---

## Authentication

Users register with email/password or sign in with Google OAuth. Email verification is required for new accounts. A password reset flow is available. The backend issues JWT tokens stored in HttpOnly cookies, with a localStorage fallback for Safari.

Public browsing (fixtures, news, stats, leaderboard) requires no account. Creating posts, commenting, voting, and making predictions requires authentication.

---

## Environment Setup

```bash
# Required
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000   # FastAPI backend
API_SPORTS_KEY=your_key                         # api-sports.io key

# Optional
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
NEXT_PUBLIC_SITE_URL=https://abovethespread.com
```

---

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

The project uses TypeScript strict mode and ESLint with Next.js rules. There is no test suite currently.

---

## Repository Structure (top level)

```
src/
├── app/            # Next.js App Router pages and API routes
├── services/       # React Query hooks for FastAPI and football API
├── components/     # Reusable UI components
├── type/           # TypeScript type definitions
├── lib/            # Utility functions
├── hooks/          # Custom React hooks
├── data/           # Constants (league IDs, theme colors, nav structure)
├── config/         # Season configuration
└── providers/      # React Query and theme providers

docs/               # Project documentation
public/             # Static assets
```

For architecture details, data flow, and coding patterns, see [`01-system-overview.md`](./01-system-overview.md).
