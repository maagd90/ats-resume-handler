# ATS-Friendly Agent

Autonomous 24/7 job-hunting agent: review/optimize resume and LinkedIn, search jobs against user-defined criteria, tailor resume + cover letter per JD, and apply automatically.

## Features

- **Resume ATS Review** — Upload, score, optimize, and store base resume template
- **LinkedIn Optimizer** — Profile analysis and job-hunting recommendations
- **Job Criteria** — Configurable titles, locations, skills, thresholds, and daily caps
- **24/7 Background Agent** — Celery + Redis scheduled job search and apply pipeline
- **JD Tailoring** — Per-job resume variants via LLM
- **Cover Letters** — Unique cover letter per application
- **Auto-Apply** — Email (SMTP) and Playwright browser apply with manual queue fallback
- **Applications Dashboard** — Track, approve, skip, and retry applications

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload --app-dir .
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Full Stack (Docker)

```bash
docker compose up --build
```

Services: `backend` (8000), `frontend` (3000), `worker`, `beat`, `redis`, `postgres`

### Celery Worker (local)

```bash
# Terminal 1 — Redis required
redis-server

# Terminal 2
cd backend && celery -A src.worker.celery_app worker --loglevel=info

# Terminal 3
cd backend && celery -A src.worker.celery_app beat --loglevel=info
```

## Environment Variables

See [`backend/.env.example`](backend/.env.example):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | LLM tailoring and cover letters |
| `JSEARCH_API_KEY` | Live job search (mock fallback if unset) |
| `REDIS_URL` | Celery broker |
| `DATABASE_URL` | SQLite (local) or PostgreSQL (Docker) |
| `SMTP_USER` / `SMTP_PASSWORD` | Email apply (Tier 1) |

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET/PUT /api/v1/criteria` | Job search criteria |
| `GET/POST /api/v1/agent/start\|stop\|status` | Agent control |
| `GET /api/v1/applications` | Application list |
| `POST /api/v1/applications/{id}/approve` | Approve queued application |

## License

MIT
