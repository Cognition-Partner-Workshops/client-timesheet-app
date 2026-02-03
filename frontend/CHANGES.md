# Changes for Issue #3, PR #143

## Summary

Fixed the frontend ESLint error `react-refresh/only-export-components` in `AuthContext.tsx`.

## Problem

The `AuthContext.tsx` file was exporting both a React component (`AuthProvider`) and a custom hook (`useAuth`). This triggered the ESLint rule `react-refresh/only-export-components`, which requires files to only export components for fast refresh (hot module replacement) to work properly during development.

## Solution

The `useAuth` hook was moved to a separate file at `frontend/src/hooks/useAuth.ts`. This allows the `AuthContext.tsx` file to only export the `AuthProvider` component, satisfying the ESLint rule.

## Files Changed

1. `frontend/src/hooks/useAuth.ts` - Added comment referencing issue #3 and PR #143

## Verification

Run `cd frontend && npm run lint` to confirm no ESLint errors remain.
