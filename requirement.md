# Home Management Application

I want to build a home management application with multiple features. It will be on web and mobile.

## Folder Structure

```
/WebUI/       -- Web frontend (React + Vite)
/ServerAPI/   -- Backend APIs (Python)
/MobileUI/    -- Mobile app (React Native + Expo) -- current focus
```

## Tech Stack for Web

- React (Vite)
- Styling: Tailwind CSS
- Backend: Python (FastAPI), SQLAlchemy + Alembic for ORM/migrations
- DB: SQLite for now; will move to Postgres later (SQLAlchemy makes this a low-effort swap)
- Dev wiring: Vite dev server proxies `/api/*` to the FastAPI server (uvicorn on port 8000) — UI calls relative `/api/...` paths, no CORS needed in dev
- API auth: none yet (open API) — matches the current mock "logged in as" phase; real auth (Google OAuth + invite login) is a later phase

### Data model (SQLite/Postgres)

**households**: id (PK), name, created_at — one household per signed-up admin; a display label only for now (not yet used to scope/filter queries, since each install currently supports a single household)

**family_members**: id (PK), household_id (FK), name, role (admin/member), color, avatar_initials, relationship, relationship_other (nullable), google_email (nullable, unique), google_picture (nullable), created_at

**tasks**: id (PK), title, description, assignee_id (FK), created_by_id (FK), priority, status, category, due_at (nullable), reminder_enabled, reminder_remind_at (nullable), reminder_frequency, created_at

**member_invites**: id (PK), member_id (FK, unique), token (unique), created_at — one active invite per member; generating a new one overwrites the old

No mock/seed data — a fresh database starts completely empty; the first admin signup creates the first household and its first family_members row.

Invite token/QR generation moved server-side: `POST /members/{id}/invite` generates and stores the token; the UI renders the QR from the token the API returns.

## Current Focus: TaskManagement Module

1. User can create a task
2. Assign the task to another family member
3. Set a reminder for the task
4. Admin can open a task and manually trigger "Send reminder now", which notifies the assignee immediately (independent of the scheduled reminder time)

### Task fields

- Title
- Assignee (family member)
- Description / notes
- Priority (Low / Medium / High)
- Category / tag (e.g. Chores, Bills, Shopping, Maintenance)
- Status (To Do / In Progress / Done)
- Due date/time
- Reminder
  - Notification-style reminder (e.g. remind me 1 hour before)
  - Recurring reminders (daily, weekly, etc.)

### Manual "Send Reminder" (Admin action)

- On the task detail view, the Admin sees a "Send reminder" action.
- Only the Admin role can trigger this (not the task creator or other family members).
- Triggering it notifies the task's assignee immediately, on top of/independent from any scheduled reminder already configured on the task.
- Current phase: no real notification/push system yet. Clicking "Send reminder" shows an in-app confirmation (e.g. a toast: "Reminder sent to {assignee name}") to simulate the notification being triggered. Real delivery (push/SMS/email) is a later backend phase.

### Views / Pages

- Task list / dashboard (filterable by assignee/status)
- Create / edit task form
- Task detail view (includes Admin-only "Send reminder" action)
- Family members view, including:
  - Admin-only "Add family member" screen (minimal form: name, relationship, role)
    - Relationship: dropdown of common relations (Wife, Husband, Son, Daughter, Mother, Father, Grandmother, Grandfather, Other) with a free-text field when "Other" is selected
    - Role: defaults to "Family member"; admin can also set "Admin" from the form
  - Admin-only "Edit family member" screen — same fields as add (name, relationship, role)
  - Admin-only "Generate invite" action per member — a manual, per-member action (not automatic on creation) that produces a mock invite token and QR code for that member to use to log in later

## Authentication & Family Setup

- Admin logs in via Google authentication (implemented — see below). Family members log in using their individual unique QR code / code (no Google authentication needed) — **not yet implemented**.
- Admin can add family members (minimal details) and generate a unique QR code / code per family member (implemented, UI + API).

### Google Sign-In & Signup (Admin) — implemented

- Landing page (`/`, unauthenticated): generic Hearth branding with two entry points, **Log in** and **Sign up**. Both go through the same Google OAuth flow; the choice is carried through as an `intent` (`login` or `signup`) so the backend/frontend know which path the user chose.
- Flow: backend-driven OAuth 2.0 Authorization Code flow (not a frontend JS SDK), chosen specifically so the same backend endpoints can be reused by a future mobile app (native apps do the equivalent code exchange, just via an in-app browser/AuthSession instead of a web redirect).
  1. Frontend redirects the browser to `GET /api/auth/google/login?intent=login|signup`.
  2. Backend redirects to Google's consent screen.
  3. Google redirects back to `GET /api/auth/google/callback` (registered redirect URI: `http://localhost:8000/api/auth/google/callback`).
  4. Backend exchanges the code for tokens, verifies the Google ID token, extracts email/name/picture.
  5. Backend checks whether a `family_members` row already has this Google email:
     - **Existing account** → issue a full session JWT and redirect straight to the dashboard. This happens regardless of whether the user clicked Login or Signup — an existing account always lands in the app, never re-onboarded.
     - **No existing account** → issue a short-lived **pending** JWT (marks "Google-verified, not yet onboarded") and redirect to `/onboarding` instead of the dashboard.
  6. On `/onboarding`, the user enters their **name** and a **family name** (household display label). Submitting calls `POST /api/auth/onboarding` with the pending JWT, which creates a new `households` row and the first `family_members` row (role=admin, linked to the Google email), then returns a full session JWT.
  7. Frontend stores whichever JWT it received (bearer token) and calls `GET /api/auth/me` to load the current admin once onboarding is complete.
- Session handling: our own JWT, sent as `Authorization: Bearer <token>` on subsequent requests — deliberately not cookie-based, since bearer tokens work identically on web (localStorage) and a future mobile app (secure storage), whereas cookies are awkward on native. Pending (pre-onboarding) tokens are distinguished from full session tokens by a claim in the JWT payload and are only accepted by the onboarding endpoint.
- Once the admin is logged in via Google, the mock "logged in as" family-member switcher is **removed** — the app shows the real logged-in admin. Family-member login (invite code/QR) is a separate, not-yet-built flow; until it exists there is no way to act as a non-admin member in the running app.
- Secrets (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `JWT_SECRET`) live in `ServerAPI/.env` (gitignored); `.env.example` documents the required keys.

## Current Phase Scope

- ServerAPI (FastAPI + SQLAlchemy + SQLite) backs TaskManagement, family members, invites, and Google admin auth (login + signup/onboarding) — real persistence, no mock/seed data anywhere.
- WebUI calls the ServerAPI for all data. Unauthenticated visitors see a generic landing page with Login/Sign up; new Google accounts go through an onboarding step (name + family name) before reaching the dashboard; returning accounts go straight to the dashboard.
- Family-member (non-admin) login is not yet implemented, so the app currently only supports using it as the admin.
- Follow industry-standard project structure and senior developer practices for both API and UI development.

## Mobile (MobileUI) — React Native + Expo

- Tooling: Expo (managed workflow) — fastest path to a running app without a full native toolchain, works well with `expo-auth-session`/`expo-web-browser` for the OAuth handoff.
- First milestone: **Auth + Dashboard only** (Google sign-in/signup, onboarding, task dashboard) — full screen parity with WebUI comes later once this core loop is proven on-device.
- Dev API access: the FastAPI server is reached via the dev machine's LAN IP (e.g. `http://192.168.x.x:8000`), not `localhost`, since a phone/emulator can't reach the host machine's loopback address the way a browser on the same machine can.
- Google OAuth on mobile: same backend-driven Authorization Code flow as web, reusing the same `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (the mobile app never talks to Google directly — it opens a system browser to our own `/api/auth/google/login`, identical to web). The difference is only the final redirect target:
  - Web redirects to `http://localhost:5174/auth/callback#token=...`
  - Mobile redirects to a custom URL scheme, `hearth://auth/callback?token=...`, which the backend selects based on a `platform=mobile` (or similar) query param passed through `/google/login` so it knows which redirect target to use for that request.
  - The app registers the `hearth://` scheme (via Expo's `scheme` config) and `expo-web-browser`'s `openAuthSessionAsync` opens the system browser, then captures the redirect back into the app.
- Session storage: the same bearer JWT approach as web, but persisted via `expo-secure-store` instead of `localStorage`.
- Backend changes required: `/api/auth/google/login` and `/api/auth/google/callback` need to support a mobile redirect target alongside the existing web one (both driven from the same OAuth code, no duplicate endpoints).
