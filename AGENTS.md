# AGENTS.md - Dentixcy CRM Agent Guidance

## Overview
Dentixcy CRM is a React + Vite SPA backed by Firebase Firestore for dental practice lead management.

## Architecture
- **Frontend**: React 19, Vite, Recharts, @hello-pangea/dnd, date-fns, @react-oauth/google
- **State**: Local React state + Firestore real-time listeners (useLeads/useEvents hooks)
- **Styling**: Custom CSS implementing Vercel Geist design system (tokens in index.css)
- **Entry**: `src/main.jsx` → `<App />`
- **Auth Gate**: `App.jsx` renders `<LoginPage />` until authenticated, then `<CRMApp />`
- **Providers**: GoogleOAuthProvider → AuthProvider → ToastProvider → Root
- **Dead Code**: `src/main.ts`, `src/style.css`, `src/counter.ts` (Vite template leftovers)

## Firebase Data Model
Collections (client‑side SDK, no backend):
- `team` (doc ID = normalized email):
  - `email` (string, lowercased)
  - `name` (string)
  - `role` ('admin' | 'user')
  - `salespersonId` (string | null)
  - `addedAt` (ISO date string)
  - `isOwner` (boolean)
- `leads` (doc ID = lead.id):
  - `id` (string)
  - `name`, `email`, `phone` (string)
  - `treatment` (string from mockData.TREATMENTS)
  - `expectedRevenue` (number)
  - `stage` (string from mockData.PIPELINE_STAGES)
  - `salesperson` (string, matches teamMember.salespersonId)
  - `source` (string from mockData.LEAD_SOURCES)
  - `createdAt` (YYYY-MM-DD)
  - `notes` (string)
  - `priority` ('high' | 'medium' | 'low')
- `events` (doc ID = dateKey 'YYYY-MM-DD'):
  - `dateKey` (string)
  - `events`: array of `{ id, title, type ('call'|'meeting'|'appointment'|'task'), time (HH:mm) }`

Seeding: On first load, if `leads` or `events` collections are empty, they are batch‑seeded from `src/data/mockData.js`. Real‑time `onSnapshot` keeps all tabs in sync.

## Authentication & RBAC
- **Google OAuth** via `@react-oauth/google` (client ID in `.env`).
- **Session**: Stored in `sessionStorage` under `crm_session_v2`; isolated per browser/incognito.
- **Bootstrap**: First signer‑in becomes owner‑admin if `team` collection empty.
- **Known members**: Role loaded from Firestore; unknown sign‑ins are blocked with a message to ask admin.
- **RBAC Enforcement**:
  - `admin`: full access (all leads, team management, all analytics).
  - `user`: restricted to leads where `lead.salesperson === user.salespersonId`.
  - UI guards: detail panel edit/delete disabled, modal salesperson locked, Team tab hidden.
- **Real‑time sync**: Team snapshot updates local session when role changes remotely.

## Design System
- Implements **Vercel Geist** (see `DESIGN.md` for full spec):
  - Colors: `--color-ink` (#171717), `--color-body` (#4d4d4d), `--color-mute` (#8f8f8f), `--color-hairline` (#ebebeb), `--color-canvas` (#fafafa), `--color-elevated` (#ffffff), accent blues/pinks/etc.
  - Spacing: `--sp-xxs` (4px) → `--sp-3xl` (64px) → `--sp-section` (128px).
  - Radius: `--r-sm` (6px) → `--r-md` (12px) → `--r-lg` (16px) → `--r-pill` (100px) → `--r-full` (9999px).
  - Typography: Geist Sans (weights 400/500/600), Geist Mono for code/eyebrows.
  - Components: badge, avatar, search/input/select, modal, toast, nav pills, Kanban card, calendar day, stat card.
- All styling lives in `src/index.css` (CSS custom properties). No external UI libraries.
- Responsive breakpoints: mobile ≤640px, tablet 768px, laptop 1024px, desktop ≥1200px.

## Important Conventions & Rules for Future Agents
1. **Do NOT modify** `src/main.ts`, `src/style.css`, `src/counter.ts` – they are unused Vite leftovers.
2. **Firestore access**: Only via hooks `useLeads` and `useEvents`. Keep real‑time listeners; avoid direct DB calls in UI components.
3. **State shape**: Keep lead/event objects exactly as defined in Firestore; do not add client‑only fields unless transient UI state.
4. **Authentication**: All role checks must use `useAuth()` → `isAdmin` / `salespersonId`. Never hard‑code role strings.
5. **Modals & Panels**: Reuse `LeadModal` (add/edit) and `LeadDetailPanel` (view/stage change/email compose). Email compose logs to console; do not implement actual sending.
6. **Toast**: Use `useToast()` hook for all user feedback (success/error). Keep message concise.
7. **Icons**: Use the inline SVG set in `src/components/Icons.jsx`. Do not import external icon packs.
8. **Formatting**: Use `formatINR` / `formatINRCompact` from `src/lib/format.js` for currency; `format` from date-fns for dates.
9. **Phone numbers**: Store as `"+CC xxx xxx xxxx"`; UI uses country dropdown from `COUNTRY_CODES` in format.js.
10. **Analytics data**: Currently uses static arrays in mockData.js; if changing to live data, update `AnalyticsPage.jsx` accordingly.
11. **Commit messages**: End with `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
12. **Pull request descriptions**: End with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
13. **File naming**: Use `.jsx` for React components, `.js` for hooks/lib, `.css` only for global styles.
14. **Linting**: No ESLint/Prettier config present; follow existing code style (2‑space indentation, semicolons, arrow functions, implicit returns where appropriate).
15. **Environment**: Keep `.env` with only Firebase & Google OAuth IDs; never commit real secrets (already in .gitignore).
16. **Vercel**: Deployment configured via `.vercel/project.json`; do not change unless adjusting project ID.

## Directories to Avoid Touching
- `node_modules/` (dependencies)
- `dist/` / `dist-ssr/` (build outputs)
- `.vercel/` (Vercel config, except README.txt)
- `public/` (static assets – favicon.svg, icons.svg)

## Testing Guidance
- Manual verification: run `npm install`, `npm run dev`, test login with Google account, check RBAC, Firestore sync across tabs.
- No unit/test suite present; rely on manual QA.