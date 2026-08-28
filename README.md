# Cloud Drive — Frontend

A Google Drive-style web client built with Next.js (App Router), React, and Tailwind CSS. Talks to the `cloud-drive-backend` API for all data.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **State:** Local component state (`useState`/`useEffect`) — no global state library
- **API communication:** A single typed client in `lib/api.ts`, using `fetch` with credentialed (cookie-based) requests

## Project Structure

```
app/
  (auth)/
    login/            # Login page
    register/         # Registration page
  (dashboard)/
    layout.tsx         # Shared layout with sidebar, wraps every dashboard page
    page.tsx            # "My Drive" — root folder view
    folder/[id]/        # Browsing a specific folder
    search/              # Search results page
    starred/              # Starred files
    trash/                 # Trash / restore
    activity/               # Activity log
  share/[token]/         # Public share link viewer (no login required)
  layout.tsx             # Root app layout
  globals.css            # Tailwind base styles
components/              # Reusable UI pieces (see below)
lib/
  api.ts                  # Typed API client — every backend call goes through here
  types.ts                # Shared TypeScript interfaces
```

## Environment Variables (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the backend API (e.g. `http://localhost:8080` locally, or your deployed backend URL in production) |

## Setup

```bash
npm install
npm run dev     # start local dev server on http://localhost:3000
npm run build   # production build
npm start       # run the production build
```

## Pages & What Each One Does

### `/login` and `/register`
Email/password auth forms. On success, the backend sets httpOnly session cookies and the user is redirected to the dashboard.

### `/` (My Drive)
The root view. Shows folders and files with no parent folder. Includes:
- An **upload dropzone** (drag & drop, or click to pick a file)
- A **file/folder grid** with per-item actions

### `/folder/[id]`
Same layout as My Drive, but scoped to one folder. Shows a **breadcrumb trail** back to root — you can drag files/folders onto any breadcrumb to move them there instantly.

### `/search?q=...`
Full-text-style search (name match) with two dropdowns:
- **Type filter** — restrict results to a specific file type (PNG, JPEG, PDF, text, or all)
- **Sort** — newest first, name A–Z, or largest first

### `/starred`
Shows only files you've starred (★).

### `/trash`
Lists soft-deleted files and folders. Click **Restore** to bring an item back — restoring a folder also restores everything that was inside it.

### `/activity`
A chronological feed of your last 50 actions (uploads, renames, moves, deletes, shares, restores).

### `/share/[token]`
The page a public share link opens to. No login needed. If the link owner set a password, you're prompted for it first. Once resolved, shows the resource name and (for files) an **Open / Download** button.

## Components — What Each One Is For

| Component | Purpose |
|---|---|
| `Sidebar.tsx` | Left navigation (My Drive, Starred, Trash, Activity, search bar, Logout) |
| `SearchBar.tsx` | The search input in the sidebar; submitting navigates to `/search` |
| `Breadcrumbs.tsx` | Folder path trail; each crumb is also a drop target for moving items |
| `FileGrid.tsx` | Renders the folder/file cards and all their action buttons |
| `FileThumbnail.tsx` | Shows a real image preview for image files, or a type-based icon otherwise |
| `UploadDropzone.tsx` | Drag-and-drop / click-to-upload box with a live progress bar |
| `RenameDialog.tsx` | Small modal for renaming a file or folder |
| `ShareDialog.tsx` | Modal for sharing — add a person by email + pick Viewer/Editor, see who has access, revoke access, or generate a public link (with optional expiry/password) |
| `VersionHistoryDialog.tsx` | Modal showing a file's version history; lets you upload a new version or revert to an older one |

## File Actions (hover over a file card)

| Button | What it does |
|---|---|
| **Download** | Opens the file via a temporary signed URL |
| **★** | Stars the file |
| **Rename** | Opens the rename dialog |
| **Share** | Opens the share dialog |
| **Versions** | Opens version history for that file |
| **Delete** | Moves the file to trash |

Folders support **Rename** and **Delete** (which cascades to everything inside them), plus drag-and-drop to move.

## Auth & Session Handling

- Sessions are stored as httpOnly cookies (not accessible to JavaScript, set directly by the backend).
- `lib/api.ts` automatically retries a failed request once via `/api/auth/refresh` if it gets a 401, before giving up and redirecting to `/login`.
- Logging out (via the Sidebar button) clears cookies and redirects to `/login`.

## Deployment

Deployed on **Vercel**:

1. Push the repo to GitHub.
2. Vercel → Add New → Project → import this repo (framework preset auto-detects Next.js).
3. Add environment variable `NEXT_PUBLIC_API_URL` pointing to the deployed backend's URL.
4. Deploy. Vercel automatically redeploys on every push to `main`.

No demo account is pre-configured — register a new account via `/register` to try the app.

## Known Limitations

- No Google/OAuth sign-in — email + password only.
- File previews are image-only; PDFs and text files show a type icon, not an inline preview.
- No drag-and-drop upload of entire folders — only individual files.
- No pagination on search/trash/activity lists (capped at fixed limits server-side).
- Bonus-tier features (payments/Stripe, real-time collaboration via WebSockets, a native mobile/desktop app) were intentionally not attempted — each is a substantial standalone effort beyond this project's scope and timeline.