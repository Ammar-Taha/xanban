# Xanban

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss) ![Zustand](https://img.shields.io/badge/Zustand-UI%20State-F59E0B?style=flat-square) ![dnd-kit](https://img.shields.io/badge/dnd--kit-Drag%20%26%20Drop-111827?style=flat-square)

**A modern Kanban app for planning, prioritizing, and shipping work without clutter.**

[Live Demo](https://xanban-lime.vercel.app) - [Introduction](#introduction) - [Features](#features) - [Getting Started](#getting-started) - [Project Structure](#project-structure) - [Tech Stack](#tech-stack) - [Keyboard Shortcuts](#keyboard-shortcuts)

</div>

---

## Introduction

**Xanban** is a full-featured task management app built with Next.js 16 App Router, Supabase, and TypeScript. It supports multi-board Kanban workflows with drag-and-drop boards, columns, and cards, plus labels, subtasks, search, sorting, archive, and keyboard-first navigation.

### Why Xanban?

- Secure user-scoped data with Supabase Auth + PostgreSQL + RLS.
- Fast Kanban workflows with drag-and-drop and keyboard shortcuts.
- Clean UX with modal-driven actions, command palette, and search.
- Production-ready auth flows including OAuth, OTP, and password recovery.

---

## Features

| Feature | Description |
|--------|-------------|
| **Multi-board Kanban** | Create, rename, delete, switch, and reorder boards from the sidebar. |
| **Column workflow** | Add, edit, delete, color, and reorder columns per board. |
| **Task lifecycle** | Create, edit, view, move, archive, restore, and delete tasks. |
| **Drag and drop** | Reorder boards, reorder columns, and move cards across columns with `dnd-kit`. |
| **Rich task metadata** | Due date, priority (`none/low/medium/high`), labels, and subtasks with progress. |
| **Search + command palette** | Global/current-board search and quick actions via keyboard (`Ctrl/Cmd + K`). |
| **Filtering and sorting** | Filter by label and sort by default order, due date, or priority. |
| **Archive panel** | Toggle archived task list, restore tasks, or permanently delete them. |
| **Auth + onboarding** | Email/password, Google OAuth, OTP login, reset password, onboarding profile setup. |
| **Theme + persisted UI** | Light/dark mode and persisted sidebar/selected board state with Zustand. |

---

## Getting Started

### Prerequisites

| Requirement | Details |
|-------------|---------|
| [Node.js](https://nodejs.org/) | 20+ |
| [pnpm](https://pnpm.io/) | Recommended package manager |
| [Supabase](https://supabase.com) | Project for database and auth |

### Installation

1. **Clone and install**

```bash
git clone <your-repo-url>
cd "Xanban - Task Management"
pnpm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Set required vars in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional but recommended for auth redirects:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Apply database schema**

Run `supabase/schema.sql` in the Supabase SQL Editor.

4. **Run development server**

```bash
pnpm dev
```

Open `http://localhost:3000`.

### Production build

```bash
pnpm build
pnpm start
```

---

## Project Structure

```text
.
|-- app/
|   |-- (auth)/                # Login, signup, OTP, forgot/reset password
|   |-- auth/callback/         # OAuth + email auth callback exchange
|   |-- dashboard/             # Protected Kanban app
|   |-- onboarding/            # First-time user onboarding
|   `-- page.tsx               # Public landing page
|-- components/
|   |-- board/                 # Board shell, columns view, sidebar, modals, command palette
|   |-- providers/             # Auth + theme providers
|   `-- providers.tsx          # Root provider composition
|-- lib/
|   |-- board-ui-store.ts      # Persisted UI state (Zustand)
|   |-- search-tasks.ts        # Task search implementation
|   `-- supabase/              # Browser/server Supabase clients
|-- supabase/
|   |-- schema.sql             # Full schema, indexes, and RLS policies
|   `-- email-templates/       # Branded auth email templates
|-- types/                     # Supabase database types
|-- middleware.ts              # Supabase session refresh middleware
`-- README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS v4, Lucide icons, shadcn-style components |
| **State** | Zustand (persisted UI state) |
| **Drag and drop** | `@dnd-kit/core` + `@dnd-kit/utilities` |
| **Backend** | Supabase PostgreSQL + Auth + RLS |
| **Auth transport** | `@supabase/ssr` + `@supabase/supabase-js` |
| **Package manager** | pnpm |

---

## Key Modules

| Module | Purpose |
|--------|---------|
| `app/dashboard/page.tsx` | Loads boards, handles board selection, and persists board reorder positions. |
| `components/board/board-layout.tsx` | App shell that wires sidebar, header, modals, search, and command palette. |
| `components/board/sidebar.tsx` | Sidebar UI, board drag-and-drop reorder, theme toggle, and account actions. |
| `components/board/board-columns-view.tsx` | Column/card rendering, drag-and-drop movement, filters, sorting, archive list. |
| `components/providers/auth-provider.tsx` | Auth context for sign-in/up, OAuth, OTP, reset password, and session state. |
| `lib/search-tasks.ts` | Cross-board/current-board task search by title and description. |
| `lib/board-ui-store.ts` | Persisted UI state for sidebar, selected board, and modal visibility. |
| `supabase/schema.sql` | Canonical database schema, constraints, indexes, and RLS policies. |
| `middleware.ts` | Server-side session refresh for Supabase-authenticated routes. |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Command palette / search | `Ctrl+K / Cmd+K` |
| Add task | `N` |
| Board options | `Ctrl+B / Cmd+B` |
| Create board | `Ctrl+Shift+B / Cmd+Shift+B` |
| Add column | `Ctrl+Shift+C / Cmd+Shift+C` |
| Manage labels | `Ctrl+Shift+L / Cmd+Shift+L` |
| Toggle sidebar | `Ctrl+\ / Cmd+\` |

---

## Data Model (Supabase)

| Table | Purpose |
|-------|---------|
| `boards` | User-owned boards with `position` ordering. |
| `columns` | Board columns with `position`, optional `wip_limit`, and color. |
| `cards` | Task cards with `due_date`, `priority`, `position`, and `is_archived`. |
| `labels` | User-owned reusable labels with color. |
| `card_labels` | Many-to-many mapping between cards and labels. |
| `subtasks` | Per-card checklist items with completion and ordering. |

RLS is enabled on all tables with user-scoped policies.

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL used for auth redirects |

Default production URL in code/examples: `https://xanban-lime.vercel.app`.

---

## Development Notes

- No automated test suite is configured yet.
- After schema changes, regenerate `types/database.types.ts` to keep types in sync.
- Advanced roadmap items are tracked in `ENHANCEMENTS.md`.

---

## Scripts

- `pnpm dev` - Run local development server.
- `pnpm build` - Build production artifacts.
- `pnpm start` - Start production server.
- `pnpm lint` - Run lint checks.

---

## Contributing

Contributions are welcome via issues and pull requests.

<div align="center">

**[Back to top](#xanban)**

</div>
