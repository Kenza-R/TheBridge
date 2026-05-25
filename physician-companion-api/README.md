# Physician Companion (full stack)

Monorepo combining:

- **Backend** — Node 22, Fastify, PostgreSQL, Redis, BullMQ (`backend/`)
- **Frontend** — [Peer Beacon](https://github.com/Kenza-R/peer-beacon) UI (TanStack Start + React 19) (`frontend/`)

## Structure

```
physician-companion-api/
├── backend/          # REST API, Prisma, workers, docker-compose
├── frontend/         # Peer Beacon mobile-first physician app
├── package.json      # npm workspaces — run both apps with one command
└── README.md
```

## Quick start

### 1. Infrastructure

```bash
npm run docker:up
```

### 2. Install dependencies

```bash
npm install
```

### 3. Database

```bash
cp backend/.env.example backend/.env
npm run db:generate
npm run db:migrate -w backend
# After first migrate, apply RLS:
cd backend && npx prisma db execute --file prisma/migrations/20250524000001_row_level_security/migration.sql
npm run db:seed
```

Copy the seeded physician `id` from Prisma Studio (`npm run db:studio -w backend`).

### 4. Frontend env

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` — set `VITE_DEV_AUTH_TOKEN`:

```
dev:physician:dev-user:00000000-0000-4000-8000-000000000001:<PHYSICIAN_UUID>
```

### 5. Run full stack

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| API health | http://localhost:3000/health |
| Web app | http://localhost:5173 |
| API proxy | http://localhost:5173/api/v1 → API |

## Frontend ↔ API integration

The Peer Beacon UI calls the backend when a dev token is configured:

| UI surface | API |
|------------|-----|
| Home greeting | `GET /physician/me` |
| Mood check-in | `POST /physician/me/score`, `POST /self-report` |
| My Circle | `GET /physician/me/circle` |
| Wellness | `GET /wellness/meditations`, `POST /wellness/sessions` |

Without a token, the UI falls back to local Zustand mock data (original Peer Beacon behavior).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + frontend concurrently |
| `npm run dev:api` | Backend only |
| `npm run dev:web` | Frontend only |
| `npm run worker` | BullMQ notification worker |
| `npm run build` | Build both packages |

## Production notes

- Frontend built with Vite; deploy separately or behind same ALB with `/api` routed to EKS API service.
- Auth0 JWT replaces dev tokens; configure `AUTH0_*` in backend and mobile auth flow in frontend.
- HIPAA: AWS BAA, KMS, separate admin/physician DB roles — see `backend/README.md`.

## Credits

Frontend originated from [Kenza-R/peer-beacon](https://github.com/Kenza-R/peer-beacon) (Lovable / TanStack Start).
