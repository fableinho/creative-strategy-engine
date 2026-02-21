# flnt /

**A tool for creative strategists**

flnt guides creative strategists through a systematic framework for generating messaging angles — from identifying the emotional register of a product through to exporting production-ready creative briefs. Built for agency teams who run multiple client accounts and need a repeatable process for generating fresh angles at scale.

---

## What it does

Most ad brainstorming is unstructured. You get a narrow set of angles, the same people thinking the same way, and no clear path from insight to execution. flnt changes that by turning a proven strategic framework into a guided, AI-assisted workflow.

**The 5-step framework:**

1. **Creative Approach** — Choose pain-first or desire-first as the emotional register for all messaging
2. **Pain & Desires** — Map specific pain points and desires to audience segments
3. **Messaging Angles** — Generate angles at each pain × audience intersection using 10 strategic lenses
4. **Hooks** — Deploy each angle across the 5 awareness stages with targeted hooks
5. **Format Executions** — Select from 22 content formats and generate concept outlines for each hook

At every step, AI suggests — you decide. The full project context accumulates as you progress, so suggestions get sharper the further you go.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| AI | Anthropic Claude API (`claude-sonnet-4-5-20250929`) |
| Drag & Drop | @dnd-kit/core |
| PDF Export | @react-pdf/renderer |
| State | Zustand |
| Hosting | Vercel |

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Installation

```bash
git clone https://github.com/your-org/flnt.git
cd flnt
npm install
```

### Environment variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

> The Anthropic API key is used server-side only, inside Next.js API routes. It is never exposed to the client.

### Database setup

Run the schema against your Supabase project:

```bash
npx supabase db push
```

Or apply the migrations manually from `/supabase/migrations/`.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
flnt/
├── app/
│   ├── (auth)/               # Login, signup
│   ├── dashboard/            # Projects overview
│   └── projects/[id]/
│       ├── approach/         # Step 1 — Creative Approach
│       ├── pains/            # Step 2 — Pain Points & Desires
│       ├── angles/           # Step 3 — Messaging Angles
│       ├── hooks/            # Step 4 — Hooks
│       └── formats/          # Step 5 — Format Executions
├── api/
│   └── ai/                   # Server-side AI route handlers
├── components/               # Shared UI components
├── lib/
│   ├── supabase/             # DB client + types
│   └── prompts/              # Versioned AI prompt templates
└── supabase/
    └── migrations/           # Database schema
```

---

## AI architecture

All calls to the Anthropic API go through Next.js API routes — never client-side. The pattern:

```
Client → POST /api/ai/[action]
       → validate Supabase session
       → build prompt with full project context
       → call Anthropic API
       → stream response to client
```

Each step has a dedicated prompt template in `/lib/prompts/` that accumulates context from all prior steps. Prompts are versioned so they can be iterated without code changes.

---

## Data model

```
User
└── Client
    └── Project
        ├── PainDesire
        ├── Audience
        └── PainDesireAudience  ← intersection
            └── MessagingAngle
                └── Hook
                    └── FormatExecution
```

Row Level Security is enforced at the database level — users can only access their own data regardless of application logic.

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## Framework credit

The framework was inspired by [@alyshafrommotion](https://www.instagram.com/alyshafrommotion). flnt is a software implementation of that framework.

---

## License

MIT
