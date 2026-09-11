# Dentixcy CRM

A production-ready CRM system built for dental practices. Manage leads, track your sales pipeline, schedule follow-ups, and monitor team performance — all in one place.

## Features

- **Leads** — searchable, sortable list of all contacts with filters by stage, salesperson, and priority. Click any row to open a full detail panel with inline email composer and stage changer.
- **Pipeline** — Kanban board with drag-and-drop between stages, plus a List view. Displays active pipeline value and won revenue at a glance.
- **Calendar** — monthly calendar grid. Click any date to see events in the sidebar; add calls, meetings, appointments, and tasks per day.
- **Analytics** — KPI cards, monthly revenue trend, lead source breakdown, stage distribution, win/loss summary, and per-salesperson performance.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) — drag and drop
- [Recharts v3](https://recharts.org/) — charts
- [date-fns](https://date-fns.org/) — date utilities
- Design system: Vercel Geist (see `DESIGN.md`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  data/
    mockData.js        # All mock leads, events, and chart data
  components/
    Icons.jsx          # Inline SVG icon set
    LeadModal.jsx      # Add / edit lead form modal
    LeadDetailPanel.jsx # Slide-in lead detail & email composer
  pages/
    LeadsPage.jsx      # Leads list tab
    PipelinePage.jsx   # Pipeline tab (Kanban + List)
    CalendarPage.jsx   # Calendar tab
    AnalyticsPage.jsx  # Analytics tab
  App.jsx              # Root shell + state
  index.css            # Global design tokens & component styles
```
