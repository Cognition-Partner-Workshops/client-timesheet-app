/**
 * Frontend Entrypoint — React DOM Bootstrap
 *
 * This is the Vite-resolved entry module (referenced from index.html).
 * It mounts the React component tree onto the `#root` DOM node.
 *
 * Responsibilities:
 *  1. Import the global stylesheet (index.css).
 *  2. Create the React root via `createRoot` (React 18+ concurrent API).
 *  3. Render `<App />` inside `<StrictMode>` to surface potential problems
 *     during development (double-invoked effects, deprecated API warnings).
 *
 * The `<App />` component (see App.tsx) sets up all providers and routing.
 *
 * Related files:
 *  - index.css    — Global CSS reset and base styles
 *  - App.tsx      — Root component: providers, theme, router
 *  - vite.config.ts — Dev server config including the /api proxy to the backend
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
