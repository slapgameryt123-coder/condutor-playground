# Notion Clone (Electron + React)

A desktop Notion-style notes app built with Electron, React, and BlockNote.

## What the app does

- Create and edit rich-text pages
- Organize pages in a nested sidebar tree
- Drag-and-drop reorder pages within the same parent
- Search pages by title
- Manage page emoji and title inline
- View breadcrumb navigation for nested pages
- Favorite pages (stored locally in browser localStorage)
- Move pages to Trash, restore them, or delete permanently
- Use keyboard shortcuts for quick actions
- Insert custom Notion-like blocks: Calendar Embed, Bookmark Card, Callout, Toggle Section

## Tech stack

- **Desktop shell:** Electron + electron-vite
- **Frontend:** React 18 + TypeScript
- **Editor:** BlockNote
- **State management:** Zustand
- **UI styling:** Tailwind CSS + Mantine
- **Persistence:** Local JSON file in Electron `userData`

## Data storage

Page data is persisted locally to:

- `app.getPath('userData')/notion-clone-data.json`

No cloud sync or external database is used.

## Custom block notes

- Calendar embeds only render for supported HTTPS hosts (Google Calendar / Calendly).
- Unsafe protocols and local/private-network URLs are blocked for custom external URL blocks.

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build app:

```bash
npm run build
```

Preview built app:

```bash
npm run preview
```

## Keyboard shortcuts

- **Cmd/Ctrl + K**: Focus search
- **Cmd/Ctrl + N**: Create new page
- **Shift + Backspace**: Move current page to trash

## Project structure

- `src/main` — Electron main process, IPC handlers, local data layer
- `src/preload` — secure API bridge (`window.api`)
- `src/renderer` — React UI (sidebar, page view, editor, trash)

## Agent best practices (to avoid product confusion)

Use this section as the source of truth when implementing or explaining app behavior.

### 1) Functionality boundaries

- **Data is local-only**: all page data is stored in a local JSON file (`userData/notion-clone-data.json`).
- **No cloud collaboration**: do not claim multi-user sync, shared workspaces, or server persistence.
- **Trash model**: "Move to trash" is soft-delete; "Delete forever" is permanent removal.
- **Favorites scope**: favorites are UI-only and stored in renderer `localStorage`, not in the main data store.
- **Reordering scope**: drag-and-drop reordering is supported only among sibling pages (same parent).

### 2) Function map (use exact API/function names)

When changing behavior, follow this pipeline:

- **Renderer store/actions**: `src/renderer/src/store/pagesStore.ts`
- **Renderer ↔ Main bridge**: `window.api` methods in `src/preload/index.ts`
- **IPC handlers**: `pages:*` channels in `src/main/db/ipc.ts`
- **Persistence logic**: DB helpers in `src/main/db/index.ts`

Keep function names aligned across layers:

- `listPages` ↔ `pages:list` ↔ `getAllPages`
- `getPage` ↔ `pages:get` ↔ `getPage`
- `createPage` ↔ `pages:create` ↔ `createPage`
- `updatePage` ↔ `pages:update` ↔ `updatePage`
- `trashPage` ↔ `pages:trash` ↔ `trashPage`
- `restorePage` ↔ `pages:restore` ↔ `restorePage`
- `deletePage` ↔ `pages:delete` ↔ `deletePage`
- `listTrash` ↔ `pages:trash-list` ↔ `getTrashedPages`
- `searchPages` ↔ `pages:search` ↔ `searchPages`
- `reorderPage` ↔ `pages:reorder` ↔ `reorderPage`

### 3) Pricing and plan guidance

- **Current state**: this app has **no billing, subscription, or pricing logic**.
- Do not reference paid tiers, trials, seats, invoices, or checkout flows unless those features are explicitly added.
- If pricing is introduced later, document canonical values in one config/source-of-truth location and reference that location in product docs.

### 4) Implementation hygiene for agents

- Reuse existing store and IPC patterns before adding new abstractions.
- Keep naming consistent with existing `pages:*` channel conventions.
- Document feature constraints (scope + non-goals) in this README when adding functionality.
- Avoid speculative behavior in docs/UI copy; match only implemented capabilities.
