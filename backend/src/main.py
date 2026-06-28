from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import jobs, linkedin, profile, resume
from src.config import settings

app = FastAPI(title="ATS-Friendly Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/v1")
app.include_router(linkedin.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
