# Employee Management System — HR Workflow (React + Node/Express + PostgreSQL)

A connected, login-protected HR system: employees, attendance, leave requests,
and departments, all backed by a real database.

## Architecture

```
frontend/   React + Vite dashboard (what HR staff use)
backend/    Node + Express API, JWT auth, PostgreSQL
```

The frontend never talks to the database directly — everything goes through
the backend's `/api/*` routes, which require a valid login token except
`/api/auth/*`.

## How the workflow fits together

1. **Sign in.** HR staff land on a login screen. New staff can self-register
   (`Create an account`), or you can seed one admin account (below) to get
   started immediately.
2. **Dashboard.** A live overview: total employees, who's on leave, and
   leave requests waiting for approval — approve straight from there.
3. **Employees.** Add, edit, and remove employee records — name, email,
   position, and department (picked from a real dropdown of departments
   you've created).
4. **Attendance.** Pick a date and mark each employee Present / Absent /
   Leave. Numbers roll up into the summary cards at the top.
5. **Leave requests.** File a request on behalf of an employee, then
   approve or reject it. Approvals/rejections update instantly across the
   Dashboard, the sidebar badge, and this page.
6. **Departments.** Create departments; each shows a live headcount pulled
   from actual employee records. Employees tab's department dropdown reads
   from here.
7. **Reports.** Headcount broken down by department, computed from live data.

## 1. Database

Make sure PostgreSQL is running, then create the database:
```
createdb employee_management
```
Tables (`users`, `departments`, `employees`, `attendance`, `leave_requests`)
are created automatically the first time the backend starts — no manual
migration needed.

## 2. Backend

```
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
- `DB_PASSWORD` — your PostgreSQL password
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once by the seed script below

Create the first login (an admin account), then start the server:
```
npm run seed
npm run dev
```
The server runs on `http://localhost:5000`. You should see "Database
connected successfully!" and a schema-ready message in the console.

## 3. Frontend

```
cd frontend
npm install
cp .env.example .env
npm run dev
```
Runs on `http://localhost:5173`. Open it and log in with the admin email/
password you set in `backend/.env` (or register a new account from the
login screen).

## Roles

Every account has a role: `admin` (the seeded account) or `hr` (anyone who
registers). Both currently have the same permissions in the UI — the field
is there so you can restrict specific actions (e.g. deleting employees or
departments) to admins later by checking `req.user.role` in the backend
routes.

## Security notes

- Passwords are hashed with bcrypt before they're stored — never in plain
  text.
- Sessions are JWTs stored in the browser's `localStorage` and sent as a
  `Bearer` token on every request. This is simple and works well for an
  internal tool; for a public-facing production deployment, consider
  httpOnly cookies instead, which JavaScript (and so XSS) can't read.
- `JWT_SECRET` must stay private — anyone with it can mint valid logins.
- `.env` is already git-ignored on the backend.

## What's intentionally out of scope for now

- Password reset / email verification
- Per-role permission restrictions (see "Roles" above)
- File uploads (e.g. employee photos)
- A dedicated employee self-service view (this is an HR-facing tool; all
  accounts currently see the same admin-style dashboard)

These are natural next steps if you want to keep building this out.
