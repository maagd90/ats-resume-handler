from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.routes import agent, ai_info, applications, auth, billing, contact, criteria, jobs, linkedin, membership, optimizer, profile, proposals, resume
from src.config import settings
from src.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PassATS API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Stripe-Signature"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["X-XSS-Protection"] = "0"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    if settings.is_production:
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    raise exc


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
app.include_router(ai_info.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")


@app.get("/health")
async def health():
    if settings.is_production:
        return {"status": "ok"}
    return {
        "status": "ok",
        "version": "2.2.0",
        "platform_ai": settings.llm_configured,
        "payments": bool(settings.stripe_secret_key),
    }
