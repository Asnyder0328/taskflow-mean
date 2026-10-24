# TaskFlow — MEAN Stack Task Manager

Full-stack task management app built with the **MEAN stack**: **M**ongoDB · **E**xpress · **A**ngular · **N**ode.js

![Stack](https://img.shields.io/badge/stack-MEAN-47A248) ![Angular](https://img.shields.io/badge/Angular-18-DD0031) ![Node](https://img.shields.io/badge/Node-20%2B-339933)

## Features

- **Auth** — Register / login with bcrypt-hashed passwords + JWT, route guard + HTTP interceptor on the frontend
- **Kanban board** — Tasks in To Do / In Progress / Done columns, move with one click
- **Full CRUD** — Title, description, priority (low → urgent), due date, tags
- **Live stats** — Totals, completion %, overdue count, breakdown by priority (`GET /api/tasks/stats` uses Mongo aggregations)
- **Search & filter** — By text/tags, status, and priority, with sorting + pagination on the API
- **Zero-config dev DB** — If no `MONGO_URI` is reachable, the API falls back to an in-memory MongoDB so it runs anywhere

## Project structure

```
task-manager-mean/
├── backend/                 # Node + Express + Mongoose API
│   ├── server.js
│   └── src/
│       ├── config/db.js     # Mongo connection (+ in-memory fallback)
│       ├── models/          # User.js, Task.js (Mongoose schemas)
│       ├── middleware/auth.js  # JWT verification
│       ├── routes/          # auth.js, tasks.js (REST + stats)
│       ├── seed.js          # Demo user + 5 sample tasks
│       └── test-api.js      # Smoke tests (6 assertions, all passing)
└── frontend/                # Angular 18, standalone components, Signals
    └── src/app/
        ├── core/            # AuthService, TaskService, guard, interceptor, models
        └── features/        # login, register, board (Kanban + stats)
```

## Quick start

### 1. API (terminal 1)
```bash
cd backend
cp .env.example .env     # set MONGO_URI + JWT_SECRET (or leave MONGO_URI for local mongo)
npm install
npm run seed             # optional: demo@taskflow.app / demo1234 + sample tasks
npm run dev              # http://localhost:5000  — health: GET /api/health
```

No local MongoDB? Either use `docker compose up mongo`, a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster in `MONGO_URI`, or just run it — the in-memory fallback starts automatically.

### 2. Frontend (terminal 2)
```bash
cd frontend
npm install
npm start                # http://localhost:4200
```

Log in with the seeded demo account or register a new one.

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/tasks?status=&priority=&search=&sort=&page=&limit=` | Bearer | List / filter tasks |
| GET | `/api/tasks/stats` | Bearer | Aggregated stats |
| POST | `/api/tasks` | Bearer | Create task |
| GET / PUT / DELETE | `/api/tasks/:id` | Bearer | Read / update / delete (owner-only) |

## Tests

```bash
cd backend
npm test   # boots a test DB, verifies register → create → update (completedAt) → stats → 401 → delete
```
Verified 2026-10-23 against a real MongoDB 7.0.24 instance: seed, login, list, create, stats, and unauthenticated-401 all pass end-to-end, plus the 6 smoke tests. Frontend: `ng build` succeeds (332 kB initial bundle).

## Deploy

- **API:** Render / Railway — root dir `backend`, start `node server.js`, env `MONGO_URI` (Atlas) + `JWT_SECRET` + `CLIENT_URL`
- **Frontend:** Vercel / Netlify — root dir `frontend`, build `ng build`, set `apiUrl` in `src/environments/` to your API URL
- **All-in-one:** `docker compose up` brings up Mongo + API

## Tech notes

- Angular uses **standalone components + Signals** (no NgModules), functional interceptors/guards — the modern Angular 18 pattern recruiters screen for
- Passwords hashed with bcrypt (12 rounds), never returned (`select: false`)
- `completedAt` is set when a task moves to `done` — handled in both the Mongoose save hook and the update route (since `findOneAndUpdate` bypasses save hooks)
