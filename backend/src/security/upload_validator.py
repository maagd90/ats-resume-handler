"""File upload size and type validation."""

from __future__ import annotations

from fastapi import HTTPException, UploadFile

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
RESUME_EXTENSIONS = {".pdf", ".docx", ".txt"}
LINKEDIN_EXTENSIONS = {".pdf", ".docx", ".txt"}

_MAGIC = {
    b"%PDF": {".pdf"},
    b"PK\x03\x04": {".docx"},
}


def _extension(filename: str | None) -> str:
    if not filename or "." not in filename:
        return ".txt"
    ext = "." + filename.rsplit(".", 1)[-1].lower()
    return ext if ext in RESUME_EXTENSIONS | LINKEDIN_EXTENSIONS else ""


def _detect_magic(content: bytes) -> set[str]:
    for prefix, exts in _MAGIC.items():
        if content.startswith(prefix):
            return exts
    if content and all(b < 128 and (b >= 32 or b in (9, 10, 13)) for b in content[:512]):
        return {".txt"}
    return set()


async def read_upload_limited(file: UploadFile, *, allowed: set[str]) -> tuple[bytes, str]:
    if file.filename and (".." in file.filename or "/" in file.filename or "\\" in file.filename):
        raise HTTPException(status_code=400, detail="Invalid filename.")

    ext = _extension(file.filename)
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(allowed))}",
        )

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")
    if not content:
        raise HTTPException(status_code=400, detail="Empty file.")

    magic_exts = _detect_magic(content)
    if magic_exts and ext not in magic_exts and ext != ".txt":
        raise HTTPException(status_code=400, detail="File content does not match extension.")

    return content, ext
