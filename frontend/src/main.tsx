/**
 * @fileoverview React Application Entry Point
 * 
 * This is the main entry point for the Employee Time Tracking frontend application.
 * It bootstraps the React application by mounting the root App component to the DOM.
 * 
 * The application uses React 18's createRoot API for concurrent rendering features
 * and is wrapped in StrictMode to help identify potential problems during development.
 * 
 * StrictMode performs the following checks in development:
 * - Identifies components with unsafe lifecycles
 * - Warns about deprecated findDOMNode usage
 * - Detects unexpected side effects
 * - Ensures reusable state (double-invokes effects)
 * 
 * @requires react - React library for building user interfaces
 * @requires react-dom/client - React DOM client for rendering
 * @requires ./index.css - Global CSS styles
 * @requires ./App - Root application component
 * 
 * @example
 * // Start the development server:
 * // npm run dev
 * 
 * // Build for production:
 * // npm run build
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Mounts the React application to the DOM.
 * 
 * The application is rendered into the 'root' element defined in index.html.
 * The non-null assertion (!) is used because we know the element exists in our HTML template.
 * 
 * @see {@link https://react.dev/reference/react-dom/client/createRoot} for createRoot API
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
