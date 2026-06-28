# ATS-Friendly Agent

Autonomous job-hunting platform with freemium profile optimization and Prime 24/7 agent. **Platform AI is included** — users never provide their own API keys.

## Plans

| Plan | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 3 optimizations/month, ATS review, LinkedIn guidance, Word downloads |
| **Prime 3 mo** | $29.97 | Unlimited optimizations + 24/7 agent + tailoring + auto-apply + **AI included** |
| **Prime 6 mo** | $53.94 | Same as Prime, ~10% savings |
| **Prime 12 mo** | $95.88 | Same as Prime, best value |

AI costs (OpenAI/Anthropic) are covered by subscription — one platform key serves all members.

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Set OPENAI_API_KEY (platform only), JWT_SECRET, STRIPE_SECRET_KEY
uvicorn src.main:app --reload --app-dir .
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000/login to register, then `/optimize`.

### Docker

```bash
docker compose up --build
```

## Environment (platform operator)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Platform AI for all users (never shown to users) |
| `JWT_SECRET` | Auth token signing |
| `STRIPE_SECRET_KEY` | Prime checkout |
| `STRIPE_WEBHOOK_SECRET` | Payment confirmation webhook |
| `FRONTEND_URL` | Stripe redirect URLs |
| `JSEARCH_API_KEY` | Live job search |
| `REDIS_URL` | Celery broker |

## API Highlights

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/v1/auth/register` | No | Create account |
| `POST /api/v1/auth/login` | No | Get JWT |
| `POST /api/v1/optimizer/run` | Yes | Full optimization pipeline |
| `GET /api/v1/billing/plans` | No | List 3/6/12 month plans |
| `POST /api/v1/billing/checkout?plan_id=prime_3m` | Yes | Stripe checkout |
| `POST /api/v1/billing/webhook` | Stripe sig | Activate Prime |

## Architecture

- **Free tier:** Resume ATS review, LinkedIn paste + guidance, ASCII-safe Word export
- **Prime tier:** Celery 24/7 job loop, JD tailoring, cover letters, email/browser apply
- **Auth:** JWT per user; profile/criteria/proposals scoped to `user.id`
- **Billing:** Stripe one-time checkout → `prime_expires_at` extended by plan months

## License

MIT
