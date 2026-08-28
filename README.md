# Circle CRM — Frontend Assessment

A Customer Relationship Management (CRM) web application built with **React.js + Redux Toolkit**. It demonstrates scalable React architecture, complete CRUD workflows, dynamic state management, and localStorage persistence — all without a backend/API.

## Tech Stack

- **React 19** + **TypeScript**
- **Redux Toolkit** (RTK) with `createEntityAdapter`, typed hooks, and a listener middleware for cross-slice activity logging
- **React Router 7** (protected routes)
- **Tailwind CSS v4** (HSL 60-30-10 theme, class-based dark mode, responsive)
- **React Hook Form + Zod** (form validation)
- **Recharts** (dashboard charts)
- **@dnd-kit** (drag-and-drop Kanban task board)
- **@tanstack/react-virtual** (virtualized tables for large datasets)
- **lucide-react** (icons), **Radix UI** primitives
- **Vitest + Testing Library** (unit & component tests)
- **Husky + lint-staged** (pre-commit lint/format)

## Getting Started

Requires Node.js 20+ and pnpm.

```bash
# 1. Install dependencies
pnpm install

# 2. Start the dev server
pnpm dev

# 3. Build for production
pnpm build

# 4. Preview the production build
pnpm preview

# 5. Run tests
pnpm test          # one-shot
pnpm test:watch    # watch mode

# 6. Lint
pnpm lint
```

## Mock Credentials

| Role  | Email                 | Password    | Permissions                     |
| ----- | --------------------- | ----------- | ------------------------------- |
| Admin | `admin@circlecrm.com` | `Admin@123` | Full access (incl. delete/bulk) |
| Sales | `sales@circlecrm.com` | `Sales@123` | Read/create/edit; delete hidden |

On first login with an empty store, the app offers to load sample (demo) data.

## Implemented Features

### Auth

- Login screen with email/password validation (React Hook Form + Zod)
- Mock login with role-based users
- Logout with confirmation
- Protected routes (`ProtectedRoute`) redirect unauthenticated users to `/login`

### Dashboard

Dynamically computed from Redux state:

- Total Customers, Total Leads, Converted Leads, Pending Tasks, Completed Tasks
- Recent Customers, Recent Activities
- Charts: customer growth, lead pipeline, task status (Recharts)

### Customers

- List with **debounced search**, **status filter**, **sorting**, **pagination**
- **Bulk selection** and **bulk delete** (admin only)
- Add / Edit via a reusable zod-validated modal form
- Delete with confirmation dialog
- **CSV export**
- Customer details page: info, assigned employee, **notes**, related **tasks**, **activity history** tabs

### Leads

- List with search / filter / sort
- Add / Edit / Delete
- Status pipeline: `New → Contacted → Follow-up → Qualified → Converted / Lost`
- Assign employee, change status
- **Convert lead to customer** — automatically creates a customer record and marks the lead as `Converted`

### Tasks

- List with search, status & priority filters, sorting, pagination
- Add / Edit / Delete, assigned employee, priority (`Low/Medium/High`), due date, status
- **Kanban drag-and-drop board** (toggle between list and board)
- Status updates: `Todo → In Progress → Completed`

## State Management

All CRM data lives in Redux slices — not component state:

- `authSlice` — authentication & role
- `customerSlice`, `leadSlice`, `taskSlice` — entity adapters + UI state (search/filter/sort/page/selection)
- `notificationSlice` — toast notifications
- `uiSlice` — UI preferences (e.g. theme)
- `activitySlice` — global activity history

**Cross-slice logic:**

- A listener middleware auto-logs an activity entry whenever a customer/lead/task is created.
- Lead→Customer conversion dispatches into both `leadSlice` and `customerSlice`.

**Persistence:** A debounced `store.subscribe` writes a single versioned key to `localStorage`; on boot the state is restored as `preloadedState` and rehydrated — data survives browser refresh.

## Project Structure

```
src/
├── assets/
├── lib/
│   ├── utils.ts          # cn() classname helper
│   └── components/       # reusable UI primitives (Button, Input, Modal, Table,
│                         #   Pagination, Badge, ConfirmDialog, Toast, Tabs, ...)
├── components/           # feature-composed components (dashboard, customers, leads, tasks)
├── pages/                # route pages
├── layouts/              # AuthLayout, AppLayout (sidebar + topbar)
├── store/
│   ├── index.ts          # configureStore + persistence + listener
│   ├── hooks.ts          # typed useAppDispatch / useAppSelector
│   ├── listener.ts       # activity logging middleware
│   ├── persistence.ts
│   └── slices/           # 7 slices + colocated tests
├── schemas/              # zod schemas (+ validation tests)
├── services/             # storage, employees, seed, csv-export
├── routes/               # AppRoutes, ProtectedRoute
├── test/                 # vitest setup
└── types/                # shared types
```

## Tests

Vitest + React Testing Library cover the assessment's minimum required cases:

- Login (thunk + component validation + success redirect)
- Add / Edit / Delete / Search / Filter customer
- Lead conversion
- Task status update
- Redux reducer functionality (all slices + selectors)
- Form validation (zod)

```bash
pnpm test
```

## Bonus Implemented

- TypeScript
- Dark mode toggle
- Drag & drop Kanban task board
- Export customers & leads to CSV
- Dashboard charts (Recharts)
- Role-based permissions
- Virtualized tables for large datasets
- Toast notifications & confirmation dialogs
- Loading / empty / error states + `ErrorBoundary`
