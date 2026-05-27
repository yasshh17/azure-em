# EM — Claude Code Project Reference

This file is the single source of truth for the EM project. Claude Code reads this at the start of every session. Never summarize, skip, or abbreviate any section.

---

## 1. Project Overview

**EM** is a luxury AI property management assistant built for **Azure Residences** — a 24-unit ultra-luxury oceanfront high-rise on **Collins Avenue, Miami Beach**.

### What Problem It Solves

Property managers at ultra-luxury residential buildings spend hours each day context-switching between lease spreadsheets, maintenance logs, vendor contacts, and tenant records. EM consolidates all of that into a single AI interface. A manager can ask a natural-language question — "Which leases expire this month?" or "Log a high-priority HVAC ticket for unit 8C" — and receive a structured, action-ready response in seconds. No spreadsheets. No phone trees. No manual lookups.

### Who It Is For

The primary audience is property managers at Azure Residences. The interface is designed for one operator who manages all 24 units across the building. The demo is built for **Matias Alem, CEO of BRG International**, a luxury real estate company headquartered in Miami Beach. The purpose of this demo is to show him what his EM property management platform could look like — built in two days using his exact tech stack — so he can make an informed decision about commissioning the full product.

### Building Details

| Field | Value |
|---|---|
| Building Name | Azure Residences |
| Address | Collins Avenue, Miami Beach, Florida |
| Total Units | 24 |
| Rent Range | $8,500 – $28,000 / month |
| Building Type | Ultra-luxury oceanfront high-rise |
| Client | Matias Alem, CEO, BRG International |

### Why It Was Built This Way

The demo was scoped to three screens (login, dashboard, AI chat) to maximize visual impact and demonstrate AI capability within a two-day build window. Every design decision — from the gold color palette to the sharp-corner typography — signals luxury and intentionality. The architecture mirrors what a production system would look like: FastAPI backend, typed Python tools, structured Claude tool use, and a Next.js frontend. Swapping the JSON flat files for PostgreSQL and deploying to production requires no architectural changes — only the data layer changes.

---

## 2. Project Structure

```
azure-em/
├── CLAUDE.md                          # This file — single source of truth for Claude Code
├── README.md                          # Human-readable project summary and setup guide
├── .gitignore                         # Ignores node_modules, .env files, __pycache__, .next
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, global metadata, body wrapper
│   │   ├── globals.css                # Tailwind base/components/utilities + gold particle keyframes
│   │   ├── page.tsx                   # Login page — full-screen card, particles, sign-in form
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Dashboard — stat cards, maintenance list, expiring leases
│   │   └── chat/
│   │       └── page.tsx               # AI chat — message thread, input bar, quick-prompt chips
│   ├── components/
│   │   └── Sidebar.tsx                # Shared left sidebar — logo, nav links, active state
│   ├── lib/
│   │   ├── api.ts                     # All fetch calls to the backend — typed, centralized
│   │   └── types.ts                   # All TypeScript interfaces for API request/response shapes
│   ├── store/
│   │   └── chat.ts                    # Zustand store — chat history array and loading boolean
│   ├── .env.local                     # Frontend env vars — NEXT_PUBLIC_API_URL (not committed)
│   └── package.json                   # Dependencies: next, react, tailwind, framer-motion, zustand
└── backend/
    ├── main.py                        # FastAPI app entry — registers routes, CORS, health endpoint
    ├── agent.py                       # Claude integration — tool definitions, two-call loop, JSON synthesis
    ├── tools.py                       # Five tool functions — read JSON data files, return typed dicts
    ├── models.py                      # Pydantic v2 models — ChatRequest, ChatResponse, DashboardResponse
    ├── requirements.txt               # Python dependencies: fastapi, anthropic, uvicorn, pydantic
    ├── .env                           # Backend env vars — ANTHROPIC_API_KEY (not committed)
    └── data/
        ├── tenants.json               # 24 tenant records — name, unit, email, phone, move-in, status
        ├── leases.json                # 24 lease records — rent, start/end dates, status, tenant_id
        ├── maintenance.json           # Maintenance tickets — category, priority, status, vendor assignment
        └── vendors.json              # Vendor records — specialty, contact, rate, availability, rating
```

---

## 3. Tech Stack

### Frontend

| Technology | Version | Why It Was Chosen |
|---|---|---|
| Next.js | 14 (App Router) | Industry standard, file-based routing, same as BRG's existing stack. App Router enables server components and layouts without configuration. |
| TypeScript | Strict mode | Catches type errors before runtime. No `any` types allowed anywhere. Every API response shape is defined before it is consumed. |
| Tailwind CSS | 3.x | Utility-first. No separate stylesheets. No CSS modules. No class name collisions. Design tokens live in tailwind.config.js. |
| Framer Motion | 11.x | Production animation library. All page entrances, message springs, and card transitions go through Framer Motion — never raw CSS transitions for complex animations. |
| Zustand | 4.x | Minimal global state for chat history and the loading boolean. No Redux boilerplate, no context providers, no reducers. One store file. |
| Lucide React | Latest | Clean, consistent icon library. All icons are from this library — no mixing icon sources. |
| Cormorant Garamond | via next/font/google | Luxury serif typeface for building name, display titles, and score headings. Weights 300, 400, 600. |
| DM Sans | via next/font/google | Clean geometric sans for all UI text — labels, inputs, buttons, body copy. Weights 400, 500. |
| Native fetch | — | No axios. No extra dependency. All API calls use the native fetch API with typed response handling in lib/api.ts. |

### Backend

| Technology | Version | Why It Was Chosen |
|---|---|---|
| FastAPI | 0.111.x | Async-native Python framework. Cannot use Flask or Django because those would block the event loop while waiting for Claude API responses. FastAPI handles concurrent requests without threading overhead. |
| Python | 3.11+ | Latest stable. Full type hint support. Match statements. Required for Pydantic v2 compatibility. |
| Pydantic | v2 | Every request body and every response body is a typed model. FastAPI validates incoming JSON automatically. No dict unpacking in handlers. |
| Anthropic Python SDK | Latest | Official SDK. Handles authentication, retries, and streaming. Import: `import anthropic`. |
| Uvicorn | Latest | ASGI server that runs FastAPI. Started with `uvicorn main:app --reload` in development. |
| JSON flat files | — | Demo speed. Same architecture as PostgreSQL — tools.py reads files and returns the same dict shapes that SQLAlchemy queries would return. Swap tools.py for SQLAlchemy in production with zero changes to agent.py or main.py. |

### AI Architecture

**Pattern: Tool Use (Function Calling) — NOT RAG, NOT Embeddings**

Building data is relational and structured. Tool use returns exact records from the data source. RAG is for unstructured documents (PDFs, emails, notes). Using RAG for structured tenant data would introduce hallucination risk and retrieval latency with no benefit.

**Claude makes two API calls per user message:**
1. First call: Claude receives the user message and the tool definitions. It decides which tool to call and returns a `tool_use` block.
2. Second call: The tool result is appended to the conversation. Claude synthesizes the answer into the required JSON schema.

**Model:** `claude-sonnet-4-20250514` — always this exact model string. Never change it. Never use claude-opus, claude-haiku, or any other model variant in this project.

**Output:** Always structured JSON matching the ChatResponse schema. Never free prose. Never markdown. Never code fences.

---

## 4. Design System

This is a luxury product. Every pixel must communicate intentionality and restraint.

### Color Palette

| Token | Hex | When to Use |
|---|---|---|
| Background Primary | `#080C14` | Page background — the outermost surface of every screen |
| Surface Cards | `#0F1623` | Card backgrounds — stat cards, chat messages, dashboard panels |
| Deep Surface | `#0A1020` | Inset surfaces — textarea backgrounds, table row alternates |
| Borders | `#1C2333` | All borders and dividers — cards, inputs, table cells |
| Gold Accent | `#D4AF72` | Primary brand color — active nav, button backgrounds, avatars, focus rings, stat values |
| Gold Hover | `#E8C987` | Hover state for gold elements — buttons, links, interactive gold items |
| Text Primary | `#F0EDE8` | All body text — readable against dark surfaces |
| Text Muted | `#6B7A99` | Labels, subtitles, placeholder text, secondary metadata |
| Success | `#4ADE80` | Occupancy rate ≥ 90%, on-time lease status, resolved maintenance |
| Warning | `#F59E0B` | Occupancy 75–89%, leases expiring in 30–60 days, medium priority |
| Danger | `#F87171` | Occupancy < 75%, leases expiring < 30 days, urgent/high priority maintenance |

No other colors are permitted anywhere in the codebase. If a new color is needed, it must be added to this design system first.

### Typography Rules

- **Building name and display titles:** Cormorant Garamond, weights 300 / 400 / 600. Used for "AZURE", "RESIDENCES", section headings on the login card, and the EM avatar label.
- **All UI text, labels, inputs, buttons:** DM Sans, weights 400 / 500. Used everywhere else.
- **Uppercase labels:** `letter-spacing: 0.15em` minimum, up to `0.4em` for hero display text like "AZURE". Never lowercase a section label.
- **No border-radius on buttons and inputs — sharp corners only.** `border-radius: 0` always. Luxury brands signal quality through geometric precision, not rounded friendliness. This rule is absolute.

### Animation Principles

- **Page entrance:** `opacity: 0 → 1`, `y: 20 → 0`, duration 0.6–0.8s, ease out. Applied to page-level containers.
- **Stagger children:** 0.08–0.1s delay between each child element in a list or card grid.
- **Message spring:** `stiffness: 300`, `damping: 30`. Applied to new chat messages entering the thread.
- **Stat card count-up:** 1.5s duration on dashboard load, animating from 0 to the real value. Numbers only — not percentages or currency symbols (add those after).
- **Never animate more than 3 CSS properties at once.** Complexity kills frame rate.
- **Always wrap complex animations in Framer Motion.** Raw CSS transitions are permitted only for simple hover states (color, opacity) on interactive elements. Never use raw CSS for enter/exit animations.

---

## 5. The Three Screens

### Screen 1 — Login (`app/page.tsx`)

**Purpose:** Create an immediate first impression of luxury and intelligence. The login screen is the CEO's first touch point — it must communicate that this product is different before a single word is read.

**Layout:** Full-screen `#080C14` background. Centered card with `max-width: 420px`. Vertically and horizontally centered using flexbox.

**Gold Particle System:** 12 floating gold particles implemented in pure CSS keyframes — no JavaScript, no canvas, no library. Particles are absolutely positioned `div` elements with `background: #D4AF72`, `border-radius: 50%`, sizes ranging from 2px to 5px, animating with `@keyframes float` (vertical drift + opacity pulse). Each particle has a unique `animation-delay` and `animation-duration` for organic movement. Keyframes are defined in `globals.css`.

**Card Contents (top to bottom):**
1. Animated gold border — `border: 1px solid #D4AF72` with a pulse animation on the card itself
2. "AZURE" — Cormorant Garamond, ~72px, weight 400, `#D4AF72`, `letter-spacing: 0.4em`, uppercase
3. "RESIDENCES" — Cormorant Garamond, 42px, weight 300, `#F0EDE8`, `letter-spacing: 0.2em`
4. "Property Intelligence" — DM Sans, 14px, `#6B7A99`, centered
5. Email input — full width, `border-radius: 0`, border `#1C2333`, focus border `#D4AF72`, background `#0A1020`
6. Password input — same styles as email
7. "SIGN IN" button — full width, solid `#D4AF72` background, `#080C14` text, DM Sans weight 500, `letter-spacing: 0.15em`, `border-radius: 0`

**Behavior:** On submit (no real auth — any input proceeds), `router.push('/dashboard')`.

**Entrance Animation:** Framer Motion stagger — each element (logo text, subtitle, inputs, button) enters with `opacity: 0 → 1` + `y: 20 → 0` with 0.08s stagger between elements.

---

### Screen 2 — Dashboard (`app/dashboard/page.tsx`)

**Purpose:** Give the property manager an instant situational overview of the entire building. No clicks required to see what needs attention today.

**Layout:** Left sidebar (Sidebar.tsx, fixed width 240px) + scrollable main content area.

**Stat Cards Grid (2×2):**
Each card has a count-up animation from 0 to real value on page load (1.5s duration). Cards:
1. **Occupancy Rate** — percentage, color-coded: `#4ADE80` if ≥ 90%, `#F59E0B` if 75–89%, `#F87171` if < 75%
2. **Open Maintenance** — count of open/in-progress tickets, `#F59E0B` if > 0
3. **Expiring Leases (30 days)** — count of leases ending within 30 days, `#F87171` if > 0
4. **Monthly Revenue** — total active lease revenue formatted as `$XXX,XXX`, `#4ADE80`

**Two-Column Section:**
- Left: **Recent Maintenance** — last 3 open tickets. Each row shows unit, category, description truncated, priority badge (Urgent=red, High=amber, Medium=gold, Low=muted).
- Right: **Expiring Leases** — soonest expiring first. Each row shows tenant name, unit, end date, days-remaining badge (red if < 30 days, amber if < 60 days).

**Action Bar (bottom of main content):**
Three buttons:
1. "Log Maintenance" → opens a modal or navigates to chat with pre-filled prompt
2. "Draft Renewal Email" → navigates to chat with pre-filled prompt
3. "Ask EM →" → navigates to `/chat`

**Data Fetching:** Single `GET /api/dashboard` call on component mount. All data is typed using `DashboardResponse` from `lib/types.ts`. Loading state shows skeleton placeholders — not spinners.

---

### Screen 3 — AI Chat (`app/chat/page.tsx`)

**Purpose:** The core product. The property manager asks natural language questions and receives structured, actionable responses backed by real building data.

**Layout:** Same sidebar + main content. Main content is a flex column: messages area (flex-grow, scrollable) + fixed input bar at bottom.

**Welcome Message:** Pre-loaded on mount (not from API). Displayed as an EM message: "Good morning. I'm EM, your property intelligence assistant for Azure Residences. I have full access to tenant records, lease agreements, maintenance requests, and vendor contacts. How can I assist you today?" No API call is made for this message — it is hardcoded in the chat store initializer.

**Message Styles:**
- **User messages:** Right-aligned. Background `#1C2333`. Left border `3px solid #D4AF72`. DM Sans 14px `#F0EDE8`. Rounded: none.
- **EM messages:** Left-aligned. Background `#0F1623`. Left side shows a circular gold avatar with "EM" in Cormorant Garamond. DM Sans 14px `#F0EDE8`.

**Structured Response Rendering:**
EM responses contain a JSON object with up to four fields. Each field renders differently:
- `text` — Always rendered. Plain text paragraph below the avatar.
- `table` — If present: renders as an HTML table. Header row background `#D4AF72`, text `#080C14`. Body rows alternate between `#0F1623` and `#0A1020`. All cells have `border: 1px solid #1C2333`.
- `draft_email` — If present: renders in a styled preview box with a monospace-style inner card, a subject line if detectable, and a "Copy to Clipboard" button in the top-right corner.
- `action_items` — If present: renders as a checklist. Each item has a gold check circle icon (Lucide `CheckCircle2`) and text.

**Loading State:** Three pulsing gold dots (`#D4AF72`) with staggered animation while waiting for API response. Displayed as an EM message in progress.

**Quick-Prompt Chips:** Five pre-defined prompt chips above the input bar:
1. "Leases expiring soon"
2. "Open maintenance"
3. "Available HVAC vendors"
4. "Occupancy & revenue"
5. "Log a maintenance ticket"

Clicking a chip populates the input field (does not auto-submit). Style: `border: 1px solid #1C2333`, background `#0F1623`, DM Sans 12px `#6B7A99`, `border-radius: 0`.

**Input Bar:** Full-width textarea (single line, expands on Enter-shift). Send button: gold, sharp corners. Pressing Enter (without Shift) submits the message.

**Auto-scroll:** The messages container scrolls to the bottom on every new message using a `useEffect` with a `ref` on the last message element.

**Animation:** Each new message enters with a spring animation — `stiffness: 300`, `damping: 30`, `opacity: 0 → 1`, `y: 10 → 0`.

---

## 6. API Contracts

These shapes are fixed. Frontend and backend must match exactly. Never change a field name, never add optional fields without updating both sides, never return a different type for any field.

### POST /api/chat

**Request:**
```json
{
  "message": "string",
  "history": [
    { "role": "user", "content": "string" },
    { "role": "assistant", "content": "string" }
  ]
}
```

**Response:**
```json
{
  "text": "string",
  "table": [{ "Column": "value" }] | null,
  "draft_email": "string" | null,
  "action_items": ["string"] | null
}
```

`text` is always a non-empty string. `table` is an array of objects where each key is a column header — or null if no table is needed. `draft_email` is a complete plaintext email body — or null. `action_items` is an array of short action strings — or null.

---

### GET /api/dashboard

**Response:**
```json
{
  "stats": {
    "total_units": 24,
    "occupied": 22,
    "vacant": 2,
    "occupancy_rate": 91.67,
    "total_monthly_revenue": 412500,
    "expiring_soon": 3,
    "delinquent_count": 1
  },
  "recent_maintenance": [
    {
      "id": "string",
      "unit": "string",
      "category": "string",
      "description": "string",
      "priority": "urgent|high|medium|low",
      "status": "open|in_progress|resolved|closed",
      "created_date": "YYYY-MM-DD"
    }
  ],
  "expiring_leases": [
    {
      "tenant_id": "string",
      "name": "string",
      "unit": "string",
      "email": "string",
      "end_date": "YYYY-MM-DD",
      "days_remaining": 18,
      "monthly_rent": 12500
    }
  ]
}
```

`recent_maintenance` returns the 3 most recent open or in-progress tickets, sorted by created_date descending. `expiring_leases` returns all active leases expiring within 60 days, sorted by days_remaining ascending.

---

### GET /api/health

**Response:**
```json
{
  "status": "ok",
  "building": "Azure Residences"
}
```

Used to verify the backend is running. Always returns HTTP 200 with this exact shape.

---

## 7. The Five Claude Tools

These are defined in `agent.py` as tool definitions passed to the Anthropic API, and implemented in `tools.py`. The function names are fixed — `agent.py` and `tools.py` must match exactly. Never rename a tool without updating both files.

---

### Tool 1: `get_expiring_leases`

**Purpose:** Find leases that are about to expire so the manager can initiate renewals.

**Inputs:**
- `days: int` — Look-ahead window in days. Returns leases expiring within this many days from today.

**Data files read:** `leases.json` + `tenants.json` (joined on `tenant_id`)

**Returns:** Array of objects sorted by `days_remaining` ascending (most urgent first). Each object contains:
```
tenant_id, name, unit, email, monthly_rent, start_date, end_date, days_remaining, status
```

---

### Tool 2: `get_maintenance_requests`

**Purpose:** Retrieve maintenance tickets for status tracking and vendor assignment.

**Inputs:**
- `status: str | None` — Filter by status. Allowed values: `open`, `in_progress`, `resolved`, `closed`. If None, returns all statuses.
- `priority: str | None` — Filter by priority. Allowed values: `urgent`, `high`, `medium`, `low`. If None, returns all priorities.

**Data files read:** `maintenance.json` + `tenants.json` (joined on `tenant_id` to include tenant name and unit confirmation)

**Returns:** Array of objects sorted by priority descending (urgent → high → medium → low), then by `created_date` descending within each priority tier. Each object contains:
```
id, tenant_id, name, unit, category, description, priority, status, created_date, assigned_vendor_id
```

---

### Tool 3: `get_vendors`

**Purpose:** Find and recommend service vendors based on specialty and availability.

**Inputs:**
- `specialty: str | None` — Filter by vendor specialty. Allowed values: `hvac`, `plumbing`, `electrical`, `concierge`, `landscaping`, `security`, `cleaning`, `elevator`. If None, returns all specialties.
- `available_only: bool` — If True, returns only vendors where `available == true`. Default: False.

**Data files read:** `vendors.json`

**Returns:** Array of vendor objects sorted by `rating` descending (best vendors first). Each object contains:
```
id, name, specialty, contact_name, phone, email, rate_per_hour, available, rating, response_time_hours
```

---

### Tool 4: `get_occupancy_stats`

**Purpose:** Return a building-wide occupancy and revenue snapshot.

**Inputs:** None

**Data files read:** `tenants.json` + `leases.json`

**Returns:** A single object containing:
```
total_units, occupied, vacant, occupancy_rate (float, 2 decimal places),
total_monthly_revenue (sum of monthly_rent for all active leases),
expiring_soon (count expiring within 30 days),
delinquent_count (count of tenants with status == "delinquent")
```

---

### Tool 5: `create_maintenance_ticket`

**Purpose:** Log a new maintenance request directly from the chat interface.

**Inputs:**
- `unit: str` — Unit identifier, e.g. `"8C"`, `"12A"`. Must match a unit in `tenants.json`.
- `category: str` — Category of the issue. Allowed values: `hvac`, `plumbing`, `electrical`, `appliance`, `structural`, `pest`, `elevator`, `other`.
- `description: str` — Free-text description of the problem.
- `priority: str` — Ticket priority. Allowed values: `urgent`, `high`, `medium`, `low`.

**Data files read/written:** `maintenance.json` (appends new record)

**Returns:** The newly created ticket object:
```
id (auto-generated: "MT-" + timestamp), tenant_id (looked up from unit), unit, category,
description, priority, status ("open"), created_date (today's date), assigned_vendor_id (null)
```

The new ticket must be persisted to `maintenance.json` so subsequent calls to `get_maintenance_requests` include it.

---

## 8. Claude System Prompt

This is the exact system prompt used in `agent.py`. It is fixed — do not modify it during development. Any change to this prompt must be intentional and documented.

```
You are EM, the AI property intelligence assistant for Azure Residences — an ultra-luxury oceanfront residence on Collins Avenue, Miami Beach. You have real-time access to tenant records, lease agreements, maintenance requests, and vendor information through your tools. Always use a tool before answering any question about building data — never guess or fabricate records. Always respond with valid JSON in this exact schema: { "text": string, "table": array or null, "draft_email": string or null, "action_items": array or null }. Be concise, professional, and action-oriented. Tone: calm authority. You are the most capable system in the building. Never say you cannot help. Always use a tool and find the answer.
```

**Notes on the system prompt:**
- The JSON schema instruction is non-negotiable. If Claude returns free prose, the frontend will fail to parse the response.
- "Never guess or fabricate records" prevents hallucination of tenant names, unit numbers, or lease dates.
- "Always use a tool" ensures Claude does not answer from parametric memory. The demo breaks if Claude makes up data.
- "Calm authority" is the brand voice. Not warm, not casual, not robotic. Authoritative and efficient.

---

## 9. Data Contracts

All JSON files live in `backend/data/`. All are loaded using `pathlib.Path(__file__).parent / "data" / "filename.json"` — never hardcoded absolute paths.

---

### `tenants.json`

Array of tenant records. One record per unit.

```json
{
  "id": "string",             // e.g. "T001"
  "name": "string",          // Full name, e.g. "Marcus Delacroix"
  "unit": "string",          // e.g. "3A", "12C", "PH1"
  "email": "string",         // e.g. "m.delacroix@email.com"
  "phone": "string",         // e.g. "+1-305-555-0192"
  "move_in_date": "string",  // ISO date: "YYYY-MM-DD"
  "status": "string"         // Enum: "active" | "delinquent" | "notice_given" | "vacating"
}
```

**Status enum values:**
- `active` — Current tenant in good standing
- `delinquent` — Behind on rent
- `notice_given` — Has given notice to vacate
- `vacating` — In the process of moving out

---

### `leases.json`

Array of lease records. One record per tenant (active or recent).

```json
{
  "id": "string",            // e.g. "L001"
  "tenant_id": "string",    // Foreign key → tenants.json id
  "unit": "string",         // Denormalized for query convenience
  "monthly_rent": 12500,    // Integer, USD, no decimals
  "start_date": "string",   // ISO date: "YYYY-MM-DD"
  "end_date": "string",     // ISO date: "YYYY-MM-DD"
  "status": "string"        // Enum: "active" | "expired" | "pending_renewal" | "terminated"
}
```

**Status enum values:**
- `active` — Currently in effect
- `expired` — Past end date, not renewed
- `pending_renewal` — Renewal offer sent, awaiting signature
- `terminated` — Early termination

---

### `maintenance.json`

Array of maintenance ticket records. New records appended by `create_maintenance_ticket`.

```json
{
  "id": "string",                  // e.g. "MT-001" or "MT-1716220800000" for generated
  "tenant_id": "string",           // Foreign key → tenants.json id
  "unit": "string",                // Denormalized
  "category": "string",            // Enum — see below
  "description": "string",         // Free text
  "priority": "string",            // Enum — see below
  "status": "string",              // Enum — see below
  "created_date": "string",        // ISO date: "YYYY-MM-DD"
  "assigned_vendor_id": "string | null"  // Foreign key → vendors.json id, or null
}
```

**Category enum values:** `hvac` | `plumbing` | `electrical` | `appliance` | `structural` | `pest` | `elevator` | `other`

**Priority enum values:** `urgent` | `high` | `medium` | `low`

**Status enum values:** `open` | `in_progress` | `resolved` | `closed`

---

### `vendors.json`

Array of vendor/contractor records.

```json
{
  "id": "string",               // e.g. "V001"
  "name": "string",             // Company name, e.g. "Arctic Air Systems"
  "specialty": "string",        // Enum — see below
  "contact_name": "string",     // Primary contact person
  "phone": "string",            // e.g. "+1-305-555-0147"
  "email": "string",            // e.g. "dispatch@arcticair.com"
  "rate_per_hour": 185,         // Integer, USD
  "available": true,            // Boolean — currently available for dispatch
  "rating": 4.8,                // Float 1.0–5.0
  "response_time_hours": 2      // Integer — typical response time in hours
}
```

**Specialty enum values:** `hvac` | `plumbing` | `electrical` | `concierge` | `landscaping` | `security` | `cleaning` | `elevator`

---

## 10. Coding Conventions

### TypeScript (Frontend)

- All components are functional components with typed props interfaces defined above the component in the same file.
- No default exports from files that export multiple things. Named exports only.
- All API response types are defined in `lib/types.ts` and imported where needed. Never define an inline type for an API response at the call site.
- Async data fetching uses `try/catch` with typed error states. Never swallow errors silently.
- No `any` type anywhere in the codebase. TypeScript strict mode is enabled. If you need to escape the type system, use `unknown` and narrow it explicitly.
- Environment variables accessed as `process.env.NEXT_PUBLIC_API_URL` — never hardcoded URLs.
- `useEffect` dependencies must be complete — no eslint-disable comments to suppress dependency warnings.

### Python (Backend)

- All functions have complete type hints on parameters and return values. No untyped functions.
- All FastAPI endpoints have `response_model` defined using a Pydantic model from `models.py`.
- JSON files loaded using `pathlib.Path(__file__).parent / "data" / "filename.json"` — never hardcoded absolute paths, never `os.path.join`.
- Every endpoint wrapped in `try/except Exception as e` returning a consistent error shape: `{"error": str(e)}` with HTTP 500.
- Data loading functions are separate from business logic functions in `tools.py`. A function that loads a JSON file does not also filter or join — those are separate operations.
- No print statements in production code. Use Python's `logging` module if debugging is needed.
- All date operations use `datetime.date.today()` — never hardcode dates.

### Git Commit Convention

Format: `type(scope): description`

**Types:**
- `feat` — new feature or capability
- `fix` — bug fix
- `refactor` — code restructure with no behavior change
- `style` — visual/CSS changes with no logic change
- `chore` — dependency updates, config changes, non-code changes
- `docs` — documentation only

**Examples:**
```
feat(agent): add create_maintenance_ticket tool
fix(chat): resolve loading state not clearing on error
style(login): refine gold particle float animation timing
feat(dashboard): add count-up animation to stat cards
chore(backend): add uvicorn to requirements.txt
refactor(tools): separate data loading from business logic
```

---

## 11. What NOT to Do

These constraints are absolute. Claude Code must never violate them.

| Constraint | Reason |
|---|---|
| Never use axios | Use native fetch only. No extra dependency. |
| Never use CSS modules | Tailwind only. No separate `.module.css` files. |
| Never add border-radius to buttons or inputs | Sharp corners only. `border-radius: 0` always. Luxury design language. |
| Never use any color outside the documented palette | Every hex value must appear in the design system table in Section 4. |
| Never use any font other than Cormorant Garamond and DM Sans | These two fonts exclusively. No system fonts, no other Google Fonts. |
| Never stream responses from `/api/chat` | Return clean JSON. The frontend expects a single complete response object, not a stream. |
| Never use Redux | Use Zustand only. One store file. No reducers, no actions, no dispatch. |
| Never use any component library | No shadcn, no MUI, no Chakra UI, no Radix UI, no Headless UI. All components are hand-built. |
| Never hardcode `http://localhost:8000` | Always use `process.env.NEXT_PUBLIC_API_URL` in the frontend. |
| Never use `any` in TypeScript | Strict mode is enabled. Use `unknown` and narrow explicitly if needed. |
| Never fabricate building data in the agent | Claude must always call a tool before answering questions about building data. Never answer from parametric memory. |
| Never change the Claude model string | Always `claude-sonnet-4-20250514`. Never use opus, haiku, or any other variant. |
| Never modify the API contract shapes | Frontend and backend must match the contracts in Section 6 exactly. |
| Never put business logic in `main.py` | `main.py` registers routes only. Business logic belongs in `agent.py` (Claude integration) and `tools.py` (data access). |
| Never use `os.path.join` for data file paths | Use `pathlib.Path(__file__).parent / "data" / "filename.json"` always. |

---

## 12. How to Run

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create backend/.env with:
# ANTHROPIC_API_KEY=sk-ant-...

# Start the development server
uvicorn main:app --reload

# Verify the backend is healthy
curl http://localhost:8000/api/health
# Expected response: {"status":"ok","building":"Azure Residences"}
```

The backend runs on `http://localhost:8000`. Hot-reload is enabled — editing any `.py` file restarts the server automatically.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create frontend/.env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev

# Open the app
open http://localhost:3000
```

The frontend runs on `http://localhost:3000`. Both servers must be running simultaneously for the app to function.

### Verify Full Stack

1. Backend health: `curl http://localhost:8000/api/health` → `{"status":"ok","building":"Azure Residences"}`
2. Dashboard data: `curl http://localhost:8000/api/dashboard` → JSON object with `stats`, `recent_maintenance`, `expiring_leases`
3. Frontend login: Navigate to `http://localhost:3000` → login card with gold particles visible
4. Chat round-trip: Navigate to `http://localhost:3000/chat` → type "What is our occupancy rate?" → EM responds with a JSON-structured answer

---

## 13. Demo Script for CEO Meeting

Run these five questions in order. Each one demonstrates a different AI capability.

---

### Question 1: "Which leases expire in the next 60 days?"

**Tool called:** `get_expiring_leases(days=60)`

**Expected response components:**
- `text` — Summary sentence: e.g. "There are 4 leases expiring within the next 60 days. Immediate renewal outreach is recommended for the units below."
- `table` — Table with columns: Tenant Name, Unit, Monthly Rent, End Date, Days Remaining. Sorted by Days Remaining ascending. Gold header row.
- `draft_email` — null (not requested yet)
- `action_items` — null

**What this demonstrates:** Real-time data access, structured table rendering, the AI surfacing urgency without being asked.

---

### Question 2: "Show me all open maintenance requests"

**Tool called:** `get_maintenance_requests(status="open")`

**Expected response components:**
- `text` — Summary: e.g. "There are 6 open maintenance requests. 2 are marked urgent and require immediate attention."
- `table` — Table with columns: Unit, Category, Description, Priority, Created Date. Sorted urgent → high → medium → low. Priority column color-coded via badge.
- `draft_email` — null
- `action_items` — null

**What this demonstrates:** Filtered data retrieval, priority-sorted output, at-a-glance building health.

---

### Question 3: "Which HVAC vendors are available right now?"

**Tool called:** `get_vendors(specialty="hvac", available_only=True)`

**Expected response components:**
- `text` — e.g. "2 HVAC vendors are currently available. Arctic Air Systems has the highest rating at 4.8 and a 2-hour response time."
- `table` — Table with columns: Company, Contact, Phone, Rate/Hour, Rating, Response Time. Sorted by Rating descending.
- `draft_email` — null
- `action_items` — null

**What this demonstrates:** Multi-field filtering, vendor recommendation logic, AI synthesizing a recommendation from data rather than just listing it.

---

### Question 4: "What is our current occupancy rate and revenue?"

**Tool called:** `get_occupancy_stats()`

**Expected response components:**
- `text` — e.g. "Azure Residences is currently at 91.7% occupancy with 22 of 24 units occupied, generating $412,500 in monthly revenue. 3 leases expire within 30 days."
- `table` — null (single-record stats render better as prose)
- `draft_email` — null
- `action_items` — Possibly: ["Contact 3 expiring tenants this week", "Follow up on 1 delinquent account"]

**What this demonstrates:** Building-wide KPI aggregation, AI surfacing action items from data without being explicitly asked.

---

### Question 5: "Log a new maintenance ticket: unit 8C, HVAC not cooling, priority high"

**Tool called:** `create_maintenance_ticket(unit="8C", category="hvac", description="HVAC not cooling", priority="high")`

**Expected response components:**
- `text` — e.g. "Maintenance ticket MT-1716220800000 has been logged for unit 8C. The ticket is now open and visible in the maintenance queue. I recommend dispatching Arctic Air Systems — they are available with a 2-hour response time."
- `table` — null or a single-row table showing the new ticket details
- `draft_email` — null
- `action_items` — ["Contact Arctic Air Systems at +1-305-555-0147", "Notify tenant in unit 8C that a technician has been scheduled"]

**What this demonstrates:** Write capability (not read-only), data persistence, AI immediately connecting the new ticket to the most relevant available vendor — closing the action loop without a follow-up question.

---

*End of CLAUDE.md — all sections complete.*
