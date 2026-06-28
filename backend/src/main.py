from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import agent, applications, auth, billing, criteria, jobs, linkedin, membership, optimizer, profile, proposals, resume
from src.config import settings
from src.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="ATS-Friendly Agent", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(linkedin.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(criteria.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(agent.router, prefix="/api/v1")
app.include_router(optimizer.router, prefix="/api/v1")
app.include_router(proposals.router, prefix="/api/v1")
app.include_router(membership.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "2.2.0",
        "platform_ai": settings.llm_configured,
        "payments": bool(settings.stripe_secret_key),
    }
