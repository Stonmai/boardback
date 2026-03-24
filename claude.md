# Claude Instructions — BoardBack

This document defines how Claude should understand, modify, and generate code for the BoardBack project.

---

## Project Overview

BoardBack is a local-first visual workspace for bookmarks and web captures.

Key principles:
- Local-first (IndexedDB via Dexie)
- No backend / no cloud
- Fast, interactive canvas (React Flow)
- Clean, minimal UI
- Deterministic state (Zustand)

---

## Architecture

Monorepo structure:

packages/
  web/        → Next.js app (main canvas UI)
  extension/  → Chrome extension (capture tool)
  shared/     → Shared types

### Responsibilities

- web: UI, canvas logic, state, persistence
- extension: capture tabs and send data
- shared: strict TypeScript types used across packages

Claude must:
- Keep logic in the correct package
- Never duplicate shared types
- Prefer reusing types from shared

---

## React Guidelines

### Components

- Use functional components only
- Use TypeScript for all props
- Keep components small and focused
- Extract reusable logic into hooks

Avoid:
- Large monolithic components
- Deeply nested JSX
- Inline complex logic

---

### State Management (Zustand)

- Global state lives in Zustand stores
- Persisted state uses Dexie

Claude must:
- Not introduce new state libraries
- Not duplicate state between components and store
- Always update state via store actions

---

### Server vs Client

- Default to client components
- Use server components only when clearly beneficial

---

## Canvas (React Flow)

This is the core of the application.

Claude must:
- Not break node or edge structures
- Preserve React Flow conventions
- Keep node data serializable

When modifying canvas logic:
- Ensure performance (avoid unnecessary re-renders)
- Avoid heavy computations inside render functions

---

## Data Layer (Dexie)

- IndexedDB via Dexie is the single source of truth
- Zustand synchronizes with Dexie

Claude must:
- Not introduce external APIs
- Not add server calls
- Maintain a local-first architecture

---

## Extension Communication

- Uses chrome.runtime.sendMessage
- Communicates only with the web app

Claude must:
- Not introduce background servers
- Respect Chrome Manifest V3 constraints
- Keep messages minimal and structured

---

## Styling

- Use Tailwind CSS only
- Avoid inline styles unless necessary

Guidelines:
- Prefer utility classes
- Keep UI minimal and clean
- Avoid excessive styling

---

## Code Quality

Claude should:
- Use clear and descriptive naming
- Prefer early returns
- Keep functions small
- Avoid duplication
- Prioritize readability over cleverness

---

## Disallowed Changes

Claude must not:
- Add authentication systems
- Add backend or API layers
- Introduce major dependencies without strong justification
- Break the local-first architecture
- Store data outside IndexedDB
- Over-engineer abstractions

---

## Preferred Patterns

- Custom hooks for reusable logic
- Co-located component files
- Strong typing via shared
- Simple and predictable data flow

---

## Adding Features

When adding new features, Claude should:
1. Check if similar logic already exists
2. Reuse existing patterns
3. Update types in shared if needed
4. Keep changes minimal and consistent

---

## Decision Heuristics

When uncertain, prefer:
1. Simplicity over complexity
2. Consistency over novelty
3. Local-first over networked solutions
4. Explicit behavior over implicit behavior

---

## Output Style

When generating code:
- Provide complete, working snippets
- Avoid placeholders unless necessary
- Keep explanations concise unless requested otherwise

---

## Summary

BoardBack is:
- Local-first
- Visual
- Fast
- Minimal

Claude should act as a senior React engineer focused on clarity, performance, and simplicity.
