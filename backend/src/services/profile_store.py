import uuid
from datetime import datetime

from src.models.profile import CandidateProfile, ContactInfo


class ProfileStore:
    """In-memory profile store for MVP."""

    def __init__(self) -> None:
        self._profiles: dict[str, CandidateProfile] = {}
        self._default_id = "default"

    def get_or_create(self, profile_id: str | None = None) -> CandidateProfile:
        pid = profile_id or self._default_id
        if pid not in self._profiles:
            self._profiles[pid] = CandidateProfile(id=pid, contact=ContactInfo())
        return self._profiles[pid]

    def save(self, profile: CandidateProfile) -> CandidateProfile:
        profile.updated_at = datetime.utcnow()
        self._profiles[profile.id] = profile
        return profile

    def new_id(self) -> str:
        return str(uuid.uuid4())


profile_store = ProfileStore()
