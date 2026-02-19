# Creative Strategy Engine - Development Tasks

**Stack:** Next.js 14 · TypeScript · Supabase · Tailwind · Anthropic Claude API  
**Total Tasks:** Phase 1 (36) · Phase 2 (11) · Phase 3 (8)

---

## 📖 How to Use This Checklist

1. **Work sequentially** - Tasks in each section build on previous ones
2. **One task = One Claude Code session** - Copy the task line and paste into your terminal
3. **Check off as you go** - Replace `[ ]` with `[x]` when complete
4. **Commit after each task** - Claude Code works best on clean git states

### Example Claude Code Command:
```bash
claude-code "Complete task ENV-01: Initialize Next.js 14+ project with TypeScript and App Router. Use: npx create-next-app@latest --typescript --app"
```

---

## 🎯 Suggested First 5 Sessions

Start here to get the foundation right:

1. **ENV-01 → ENV-05** - Project setup with all dependencies
2. **DB-01 → DB-08** - Supabase schema, RLS, auth, TypeScript types
3. **DASH-01 → DASH-04** - Working dashboard with project CRUD
4. **NAV-01 → NAV-04 + S1-01 → S1-04** - Navigation shell + Step 1 complete
5. **S2-01 → S2-06** - Step 2 pain/audience mapping working

---

# Phase 1 — MVP (Weeks 1–6)

**Goal:** End-to-end 5-step framework with AI assistance

## 🔧 Environment Setup

- [x] **ENV-01** - Initialize Next.js 14+ project with TypeScript and App Router
  ```bash
  npx create-next-app@latest --typescript --app
  ```

- x] **ENV-02** - Install and configure Tailwind CSS + shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  ```

- [x] **ENV-03** - Install core dependencies: @dnd-kit/core, zustand, anthropic SDK
  ```bash
  npm install @dnd-kit/core zustand @anthropic-ai/sdk
  ```

- [x] **ENV-04** - Set up environment variable structure (.env.local)
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`

- [x] **ENV-05** - Create /prompts directory for versioned AI prompt templates
  - Store as .txt or .ts files, import in API routes

---

## 🗄️ Database & Auth (Supabase)

-[x] **DB-01** - Create Supabase project and connect to Next.js
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```

- [x] **DB-02** - Write SQL migration: users, clients, projects tables
  - Include enums for `organizing_principle`, `status`

- [x] **DB-03** - Write SQL migration: pain_desires, audiences, pain_desire_audiences junction
  - Add `sort_order` int for display ordering

- [x] **DB-04** - Write SQL migration: messaging_angles, hooks, format_executions
  - Include `is_ai_generated` + `is_edited` booleans on angles

- [x] **DB-05** - Enable Row Level Security on all tables with user-scoped policies
  - CRITICAL: policy = `auth.uid() = user_id` via FK chain

- [x] **DB-06** - Generate TypeScript types from Supabase schema
  ```bash
  supabase gen types typescript --project-id <id>
  ```

- [x] **DB-07** - Set up Supabase Auth with email/password + Google OAuth
  - Configure redirect URLs for local + production

- [x] **DB-08** - Create /lib/supabase.ts server and client helpers
  - Use `@supabase/ssr` createServerClient / createBrowserClient

---

## 📋 Project Dashboard

- [x] **DASH-01** - Create /dashboard route with project list grouped by client
  - Server component, fetch all active projects for user

- [x] **DASH-02** - Build 'New Project' modal: name, client, product description inputs
  - Client creation inline if no clients exist yet

- [x] **DASH-03** - Build project card component: name, client, step progress, last updated
  - Show `current_step` as 5-dot progress indicator

- [x] **DASH-04** - Implement archive and delete project actions
  - Soft delete: `status='archived'`, hard delete with confirmation modal

---

## 🧭 Framework Shell & Navigation

- [x] **NAV-01** - Create /project/[id] route as wizard shell layout
  - Persistent left sidebar + main content area

- [x] **NAV-02** - Build StepSidebar component: 5 steps with icons, active/complete states
  - Checkmark on completed steps, locked steps grayed out

- [x] **NAV-03** - Implement step progress persistence: update current_step in DB on navigation
  - Allow free back/forward navigation — don't block steps

- [x] **NAV-04** - Create shared project context (Zustand store) for accumulated state
  - Hydrate from DB on load; each step reads + writes to store

---

## Step 1 – Organizing Principle

- [x] **S1-01** - Build two-card selection UI: Pain-First vs. Desire-First
  - Full-width centered, side-by-side cards with description + examples

- [x] **S1-02** - Create POST /api/ai/step1 route: takes product description, returns recommendation
  - Prompt: infer principle from product category + rationale

- [x] **S1-03** - Show AI recommendation as highlighted suggestion with override option
  - AI card tinted purple/blue with dashed border

- [x] **S1-04** - Save selected principle + rationale to projects table on confirm
  - Update `organizing_principle` and `principle_rationale` fields

---

## Step 2 – Pain/Audience Mapping

- [x] **S2-01** - Build two-column list UI: Pain Points/Desires (left) | Audiences (right)
  - Phase 1: list view (not canvas). Canvas in Phase 2.

- [x] **S2-02** - Implement add/edit/delete for pain_desires and audiences with inline forms
  - Optimistic UI updates, save to Supabase on blur/confirm

- [x] **S2-03** - Build connection UI: checkboxes or toggle to link pains ↔ audiences
  - Each checked combo creates a `pain_desire_audiences` row

- [x] **S2-04** - Create POST /api/ai/step2 route: suggest pains and audiences for product
  - Return JSON: `{ pains: string[], audiences: string[] }`

- [x] **S2-05** - Render AI suggestions as dismissable chips below each column
  - Click chip to add to list; accept/dismiss all buttons

- [x] **S2-06** - Show intersection count badge: 'X messaging angles unlocked'
  - Compute from `pain_desire_audiences` row count

---

## Step 3 – Messaging Angles

- [x] **S3-01** - Build intersection card grid: one card per pain-audience connection
  - Card header shows pain name + audience name

- [x] **S3-02** - Render 10 lens fields inside each card as collapsible section
  - Lenses: desired_outcome, objections, features_benefits, use_case, consequences, misconceptions, education, acceptance, failed_solutions, identity

- [x] **S3-03** - Implement text inputs per lens with auto-save on blur
  - Save to messaging_angles table with lens enum value

- [x] **S3-04** - Create POST /api/ai/step3 route: generate 2-3 angle candidates per lens
  - Input: full project context + intersection + lens. Output: `string[]`

- [x] **S3-05** - Build AI suggestion display: show candidates with Accept / Edit / Regenerate
  - Accept → saves with `is_ai_generated=true`. Edit → opens inline editor.

- [x] **S3-06** - Add 'Fill All' button: batch-generate AI for all empty lens fields
  - Show progress spinner; allow cancel. Queue requests, don't parallel flood.

---

## Step 4 – Funnel Deployment

- [ ] **S4-01** - Build 5-column Trello-style board with awareness stage headers
  - Columns: Unaware, Problem Aware, Solution Aware, Product Aware, Most Aware

- [ ] **S4-02** - Populate board with all messaging angles as draggable cards
  - Card shows lens label + angle text snippet

- [ ] **S4-03** - Implement drag-and-drop with @dnd-kit/core to assign angles to columns
  - On drop: save `awareness_stage` to hooks table

- [ ] **S4-04** - Create POST /api/ai/step4-stage route: recommend awareness stage for angle
  - AI returns stage enum + brief reason why

- [ ] **S4-05** - When angle placed in column, show hook input field below card
  - Multiple hooks per angle — add hook button

- [ ] **S4-06** - Create POST /api/ai/step4-hooks route: generate 3-5 hook variations
  - Input: angle text + awareness stage + brand tone. Output: `string[]`

- [ ] **S4-07** - Implement star/favorite toggle on each hook
  - Update `is_starred` boolean in hooks table. Starred = included in export.

---

## Step 5 – Format Execution

- [ ] **S5-01** - Build 22 format cards as a selectable grid (5 category groups)
  - Categories: Storytelling, Before/After, Founder Story, Us Vs Them, Social Proof Mashup

- [ ] **S5-02** - For each starred hook, show format selection panel
  - Multi-select formats; persist to format_executions table

- [ ] **S5-03** - Create POST /api/ai/step5 route: suggest best formats for hook + stage
  - Return ranked format list with brief rationale

- [ ] **S5-04** - Generate concept outline/script for each hook+format combination
  - Call /api/ai/step5-concept; save to `concept_notes` field

- [ ] **S5-05** - Build matrix view: starred hooks as rows, selected formats as columns
  - Cell shows concept note snippet; click to expand

---

# Phase 2 — Polish & Export (Weeks 7–10)

**Goal:** PDF export, messaging library, client brand management, visual canvas

## 📄 PDF Export

- [ ] **EXP-01** - Install @react-pdf/renderer and set up server-side PDF generation
  - Create /api/export/brief route

- [ ] **EXP-02** - Build PDF template: project header, organizing principle, pain-audience map
  - Include client logo if available

- [ ] **EXP-03** - Add funnel map section: angles organized by awareness stage with starred hooks

- [ ] **EXP-04** - Add execution matrix section: hook × format table with concept notes

- [ ] **EXP-05** - Implement selective export options (choose which steps to include)
  - Checkboxes in export modal

---

## 📚 Messaging Angle Library

- [ ] **LIB-01** - Create /library route: all angles across all projects in a searchable table
  - Filter by client, pain, audience, stage, lens

- [ ] **LIB-02** - Add 'proven' vs 'untested' status flag to messaging_angles table
  - Toggle from library or from Step 3 card

- [ ] **LIB-03** - Implement 'Reuse in Project' action from library
  - Creates copy of angle in selected project

---

## 🎨 Client & Brand Management

- [ ] **CLI-01** - Build /clients route with CRUD for client profiles
  - Fields: name, logo_url, brand_colors (hex), voice_tone

- [ ] **CLI-02** - Pass voice_tone from client into all AI prompt contexts
  - Include in system prompt: 'Brand voice: {voice_tone}'

- [ ] **CLI-03** - Support branded PDF export with client logo and colors

---

## 🎛️ Visual Canvas (Step 2 Upgrade)

- [ ] **CAN-01** - Replace list view with node-and-line canvas editor
  - Consider React Flow or custom SVG approach

- [ ] **CAN-02** - Draggable pain/desire nodes on left, audience nodes on right
  - Draw lines by clicking node-to-node

- [ ] **CAN-03** - Connection lines map to pain_desire_audiences rows
  - Delete line = delete junction row

---

# Phase 3 — Scale & Collaboration (Weeks 11–16)

**Goal:** Team workspaces, commenting, performance tracking, integrations

## 👥 Team & Collaboration

- [ ] **TEAM-01** - Add organizations table; users belong to one org
  - Adjust RLS policies for org-scoped access

- [ ] **TEAM-02** - Implement role-based access: owner, editor, viewer

- [ ] **TEAM-03** - Add comments/annotations on messaging angles
  - Thread model: comments → replies

---

## 📊 Integrations & Analytics

- [ ] **INT-01** - Export to Google Docs via Docs API
  - Requires OAuth scope: documents.create

- [ ] **INT-02** - Export to Notion via Notion API
  - Create page in user's workspace

- [ ] **INT-03** - Performance tracking: link angles to ad performance data (CTR, ROAS)
  - Manual input or CSV import for MVP

- [ ] **INT-04** - Custom format library: add/remove from 22 defaults per workspace
  - Store in custom_formats table scoped to org

---

# ❓ Open Questions — Resolve Before or During Phase 1

| # | Question | Recommended Resolution |
|---|----------|------------------------|
| **OQ-1** | Streaming vs batch for AI generation? | **Streaming** (SSE via ReadableStream) feels faster but requires more frontend state management. Start with batch for MVP, add streaming in Phase 2 if needed. |
| **OQ-2** | AI cost management? | Add `api_usage` table to track tokens per user per month. Set soft limit (e.g., 1M tokens/month). Show usage in settings. Hard limit = 429 response. |
| **OQ-3** | Messaging angle library: cross-client or siloed? | **Default to per-client silos** for confidentiality. Add optional cross-client view in Phase 2 with explicit toggle. |
| **OQ-4** | Custom messaging lenses beyond the 10? | **Defer to Phase 2.** Keep lens as enum for now. Phase 2: add `custom_lenses` table scoped to org. |
| **OQ-5** | Monetization model? | **SaaS subscription** (simplest). Implement feature flags + Stripe in Phase 2. MVP is free/unlimited for early users. |

---

## 📚 Reference Documents

- **Full PRD:** `creative-strategy-engine-prd.docx`
- **Framework Visual:** `Creative_Strategy_Engine.pdf`
- **This Checklist:** Keep in project root, commit progress to git

---

## 🚀 Quick Start

```bash
# Clone or create your project directory
mkdir creative-strategy-engine
cd creative-strategy-engine
git init

# Copy this file to your repo
# (Download TASKS.md from Claude and place it here)

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Initialize Claude Code in this directory
claude-code init

# Start with your first task
claude-code "Complete task ENV-01: Initialize Next.js 14+ project with TypeScript and App Router. Use: npx create-next-app@latest --typescript --app"
```

---

**Total Progress:** 0/55 tasks complete

Good luck! 🎯
