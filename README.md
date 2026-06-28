# ATS-Friendly Agent

AI-powered platform for resume ATS review, LinkedIn optimization, and job matching.

## Features

- **Resume Review** — Upload PDF/DOCX resumes, get ATS scores, issue detection, and AI-optimized rewrites
- **LinkedIn Optimizer** — Paste your profile for headline, About, and experience improvements
- **Job Matcher** — Search jobs via JSearch API and score fit against your profile

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload --app-dir .
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

### Docker

```bash
docker compose up --build
```

## Environment Variables

See [`backend/.env.example`](backend/.env.example):

- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` — LLM-powered review and optimization
- `JSEARCH_API_KEY` — Live job search (falls back to mock data if unset)

## Project Structure

```
backend/src/
  agents/      # Resume, LinkedIn, Job agents
  parsers/     # Resume and LinkedIn text parsing
  scoring/     # ATS checker and job matcher
  api/routes/  # REST endpoints
frontend/app/  # Dashboard, Resume, LinkedIn, Jobs pages
```

## License

MIT
