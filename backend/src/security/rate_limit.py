"""In-memory sliding-window rate limiter (per IP + optional route key)."""

from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, Request


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def check(self, key: str, *, limit: int, window_seconds: int) -> None:
        now = time.time()
        cutoff = now - window_seconds
        with self._lock:
            bucket = [t for t in self._hits[key] if t > cutoff]
            if len(bucket) >= limit:
                raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
            bucket.append(now)
            self._hits[key] = bucket


rate_limiter = RateLimiter()


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def rate_limit_auth(request: Request) -> None:
    ip = client_ip(request)
    rate_limiter.check(f"auth:{ip}", limit=10, window_seconds=60)


def rate_limit_llm(request: Request, user_id: str) -> None:
    ip = client_ip(request)
    rate_limiter.check(f"llm:{user_id}", limit=20, window_seconds=3600)
    rate_limiter.check(f"llm-ip:{ip}", limit=30, window_seconds=3600)
