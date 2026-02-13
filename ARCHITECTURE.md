# Architecture: Entrypoints & Immediate Subsystems

This document describes the application's entrypoint files and the subsystems
they depend on. For each component it covers what the file does, how it connects
to the rest of the codebase, key configuration, and important patterns.

---

## Backend

### Entrypoint: `backend/src/server.js`

The Express application is assembled and started here. Its responsibilities are:

1. **Middleware stack** (applied in order to every request):
   | Order | Middleware | Purpose |
   |-------|-----------|---------|
   | 1 | `helmet` | Security HTTP headers (X-Content-Type-Options, HSTS, etc.) |
   | 2 | `cors` | Restricts cross-origin requests to `FRONTEND_URL` (default `http://localhost:5173`) |
   | 3 | `express-rate-limit` | 100 requests per 15 minutes per IP (global) |
   | 4 | `morgan` | HTTP request logging in `combined` format |
   | 5 | `express.json` | JSON body parsing with a 10 MB limit |
   | 6 | `express.urlencoded` | URL-encoded form body parsing |

2. **Route mounting** — each route module is an Express Router:
   | Path | Module | Auth |
   |------|--------|------|
   | `GET /health` | Inline handler | None (for probes) |
   | `/api/auth` | `routes/auth.js` | Per-route |
   | `/api/clients` | `routes/clients.js` | Router-level |
   | `/api/work-entries` | `routes/workEntries.js` | Router-level |
   | `/api/reports` | `routes/reports.js` | Router-level |

3. **Terminal handlers** — registered after routes:
   - `errorHandler` middleware — catches `next(err)` from any route.
   - Catch-all `*` — returns a JSON 404 for unmatched paths.

4. **Startup** (`startServer()`):
   - Calls `initializeDatabase()` to create tables/indexes.
   - Binds to `PORT` (default 3001).
   - Exits with code 1 on failure so container orchestrators detect it.

**Production override:** `docker/overrides/server.js` replaces this file in the
Docker build. The override adds static-file serving for the frontend bundle and
enhanced security settings.

---

### Auth Middleware: `backend/src/middleware/auth.js`

Exports `authenticateUser`, an Express middleware that gates all protected routes.

**Flow:**
```
Request arrives
  → Extract x-user-email header
  → Validate email format (regex)
  → SELECT from users table
      ├─ User exists → attach req.userEmail, call next()
      └─ User missing → INSERT new user row, then attach & next()
```

**Key patterns:**
- **Passwordless auth** — only an email address is required.
- **Auto-provisioning** — users are created on first request (upsert pattern).
- **Data scoping** — downstream handlers use `req.userEmail` in all WHERE clauses
  to isolate data per user (multi-tenancy at the query layer).

**Connections:**
- Called by `routes/clients.js`, `routes/workEntries.js`, `routes/reports.js`
  (router-level), and `routes/auth.js` (per-route on `GET /me`).
- Reads from `database/init.js` via `getDatabase()`.
- The `x-user-email` header is set by the frontend's API client request
  interceptor (`frontend/src/api/client.ts`).

---

### Error Handler: `backend/src/middleware/errorHandler.js`

Centralized Express error-handling middleware (4-argument signature).

**Error classification (checked in order):**
| Type | Detection | HTTP Status | Response |
|------|-----------|-------------|----------|
| Joi validation | `err.isJoi === true` | 400 | `{ error, details[] }` |
| SQLite | `err.code` starts with `SQLITE_` | 500 | Generic message |
| Other | Fallback | `err.status` or 500 | `{ error }` |

**Convention:** Route handlers that detect domain errors (not found, bad input)
respond directly with `res.status(4xx).json(...)`. This middleware is the safety
net for unexpected or framework-level errors.

---

### Database: `backend/src/database/init.js`

Manages the singleton SQLite connection and schema.

**Exports:**
| Function | Purpose |
|----------|---------|
| `getDatabase()` | Returns (or lazily creates) the singleton connection |
| `initializeDatabase()` | Creates tables and indexes inside `db.serialize()` |
| `closeDatabase()` | Gracefully closes the connection (used by test teardown) |

**Schema (3 tables with CASCADE deletes):**
```
users (email PK)
  └─ clients (id PK, user_email FK → users)
       └─ work_entries (id PK, client_id FK → clients, user_email FK → users)
```

**Indexes:** `clients.user_email`, `work_entries.client_id`,
`work_entries.user_email`, `work_entries.date` — covering the most common
WHERE and ORDER BY patterns.

**Dev vs Production:**
- Development: in-memory database (`:memory:`), data lost on restart.
- Production: `docker/overrides/database/init.js` points to
  `/app/data/timesheet.db` on a persistent Docker volume.

---

### Route Modules: `backend/src/routes/`

Each module is an Express Router with a consistent structure:

1. Import `getDatabase`, `authenticateUser`, and Joi schemas.
2. Apply `authenticateUser` at the router level (except `auth.js` which applies
   it per-route).
3. Define CRUD handlers that scope all queries with `WHERE user_email = ?`.
4. Validate input with Joi schemas; forward validation errors to `next(err)`.

| Module | Mount Path | Endpoints | Joi Schemas |
|--------|-----------|-----------|-------------|
| `auth.js` | `/api/auth` | `POST /login`, `GET /me` | `emailSchema` |
| `clients.js` | `/api/clients` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /`, `DELETE /:id` | `clientSchema`, `updateClientSchema` |
| `workEntries.js` | `/api/work-entries` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` | `workEntrySchema`, `updateWorkEntrySchema` |
| `reports.js` | `/api/reports` | `GET /client/:clientId`, `GET /export/csv/:clientId`, `GET /export/pdf/:clientId` | — |

**Notable patterns:**
- **Dynamic UPDATE queries** (`clients.js`, `workEntries.js`): only fields
  present in the validated body are included in the SET clause.
- **Ownership verification**: write operations first SELECT the target row to
  confirm it belongs to the user before modifying it.
- **Export strategies** (`reports.js`): CSV uses a temp file + `res.download()`,
  PDF streams directly via `PDFDocument.pipe(res)`.

---

## Frontend

### Entrypoint: `frontend/src/main.tsx`

The Vite-resolved entry module. It:
1. Imports the global stylesheet (`index.css`).
2. Creates the React root via `createRoot` (React 18 concurrent API).
3. Renders `<App />` inside `<StrictMode>`.

### Root Component: `frontend/src/App.tsx`

Composes the full provider hierarchy and the route table.

**Provider nesting (outermost to innermost):**
```
QueryClientProvider  →  ThemeProvider  →  CssBaseline  →  AuthProvider  →  BrowserRouter
```

**Routing (AppContent component):**
- `/login` — always accessible (public).
- `/*` — auth-gated:
  - Authenticated → renders inside `<Layout>` (AppBar + Drawer navigation).
  - Unauthenticated → redirects to `/login`.
- Unknown paths → redirect to `/dashboard`.

**Key configuration:**
- `QueryClient`: 1 retry on failure, no refetch-on-window-focus.
- MUI theme: blue (`#1976d2`) primary, red (`#dc004e`) secondary.

**Why AppContent is separate from App:** `useAuth()` must be called inside the
`AuthProvider` boundary. Splitting the components ensures the hook has access
to the context.

---

### AuthContext: `frontend/src/contexts/AuthContext.tsx`

Provides authentication state to the entire component tree.

**State & actions:**
| Name | Type | Description |
|------|------|-------------|
| `user` | `User \| null` | Current user object |
| `isLoading` | `boolean` | True during session rehydration |
| `isAuthenticated` | `boolean` | Derived from `!!user` |
| `login(email)` | `async` | Calls API, stores email in localStorage |
| `logout()` | `void` | Clears state and localStorage |

**Session rehydration:** On mount, if `userEmail` exists in localStorage, the
provider calls `GET /api/auth/me` to verify the session. On failure it clears
the stale email.

**End-to-end auth flow:**
```
LoginPage form submit
  → AuthProvider.login(email)
  → apiClient.post('/api/auth/login')
  → localStorage.setItem('userEmail', email)
  → setUser(response.user)
  → AppContent re-renders → isAuthenticated=true → show protected routes

Every subsequent API call:
  → apiClient request interceptor reads localStorage
  → Attaches x-user-email header
  → Backend authenticateUser middleware validates & scopes data

On 401 response:
  → apiClient response interceptor clears localStorage
  → Redirects to /login
```

---

### API Client: `frontend/src/api/client.ts`

Singleton Axios wrapper used by all pages and contexts.

**Responsibilities:**
1. **Base URL** — empty string; Vite proxies `/api` to the backend in dev,
   and in production the same Express server serves both.
2. **Request interceptor** — reads `userEmail` from localStorage, attaches
   `x-user-email` header.
3. **Response interceptor** — on 401, clears localStorage and redirects to
   `/login`.

**Method groups (mirror backend routes):**
| Group | Methods | Backend Module |
|-------|---------|----------------|
| Auth | `login`, `getCurrentUser` | `routes/auth.js` |
| Clients | `getClients`, `getClient`, `createClient`, `updateClient`, `deleteClient`, `deleteAllClients` | `routes/clients.js` |
| Work Entries | `getWorkEntries`, `getWorkEntry`, `createWorkEntry`, `updateWorkEntry`, `deleteWorkEntry` | `routes/workEntries.js` |
| Reports | `getClientReport`, `exportClientReportCsv`, `exportClientReportPdf` | `routes/reports.js` |
| Health | `healthCheck` | Inline in `server.js` |

**Pattern:** CSV and PDF export methods set `responseType: 'blob'` so the
browser receives binary data that pages convert to downloadable files via
`window.URL.createObjectURL()`.

---

## Request Lifecycle (Full Stack)

```
Browser
  │
  ├─ React page calls apiClient.someMethod()
  │    └─ Request interceptor adds x-user-email header
  │
  ├─ Vite proxy (dev) or same-origin (prod) forwards to Express
  │
  └─ Express middleware stack:
       helmet → cors → rateLimit → morgan → bodyParser
         │
         ├─ /health → 200 OK (no auth)
         │
         └─ /api/* → route module
              │
              ├─ authenticateUser middleware
              │    └─ Validates email, upserts user, sets req.userEmail
              │
              ├─ Joi validation (on write endpoints)
              │
              ├─ Route handler (scoped queries with WHERE user_email = ?)
              │
              └─ Response → interceptor checks for 401 → React state update
```
