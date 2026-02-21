# Creative Strategy Engine

## Project Overview
A multi-user creative copywriting tool that uses AI (Claude) to generate marketing strategy assets: messaging angles, hooks, and format executions. Users create projects, define audiences and pain/desires, then progressively generate strategy through a multi-step AI workflow.

**Data model hierarchy:** Projects → Audiences / Pain-Desires → Messaging Angles → Hooks → Format Executions

## Tech Stack
- **Framework:** Next.js (App Router) with TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui (New York style), Lucide icons
- **State:** Zustand (`src/stores/project-store.ts`)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`) — Claude Sonnet 4.5/4.6
- **Drag & Drop:** dnd-kit

## Development

### Setup
1. Copy `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. `npm install`
3. `npm run dev`

### Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Project Structure
```
src/
├── app/
│   ├── (auth)/              # Login / signup routes
│   ├── (dashboard)/         # Main app routes
│   │   ├── dashboard/       # Project list
│   │   └── projects/[id]/   # Per-project pages (angles, formats, hooks, pain-desires)
│   └── api/
│       ├── ai/              # AI generation endpoints (step1–step5, angles, hooks, concepts)
│       └── auth/            # Supabase auth callbacks
├── components/
│   └── ui/                  # shadcn/ui primitives
├── lib/supabase/            # Browser, server, and middleware Supabase clients
├── prompts/                 # Claude prompt templates
├── stores/                  # Zustand store
└── types/database.ts        # Auto-generated Supabase types
supabase/migrations/         # SQL migrations (source of truth for schema)
```

## Conventions

### General
- File names: `kebab-case.tsx`
- Components: `PascalCase`
- Database tables/columns: `snake_case`
- Path alias: `@/*` → `src/*`

### Components
- Mark client components with `"use client"` at the top
- Use shadcn/ui primitives from `@/components/ui/` for all base UI
- Use `cn()` from `@/lib/utils` for conditional class merging

### State Management
- All project data lives in the Zustand store (`useProjectStore`)
- `project-hydrator.tsx` fetches from Supabase and populates the store on project load
- Mutations update Supabase first, then update the store

### AI Endpoints
- All Claude calls go through `src/app/api/ai/` route handlers (never call Anthropic from the client)
- Prompts are defined in `src/prompts/`
- Responses are structured JSON — parse and validate before storing
- Default model: `claude-sonnet-4-5` (upgrade to `claude-sonnet-4-6` for new endpoints)

### Database
- Row-level security (RLS) is enabled — all queries are scoped to the authenticated user
- Schema changes go through Supabase migrations in `supabase/migrations/`
- Types in `src/types/database.ts` are generated from the schema — regenerate after migrations

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Anthropic API key is server-side only (no `NEXT_PUBLIC_` prefix)
