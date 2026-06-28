import uuid
from datetime import datetime, timedelta

import bcrypt
import jwt

from src.config import settings
from src.db.database import UserRow, get_session, init_db
from src.models.profile import CandidateProfile, ContactInfo
from src.services.data_store import data_store
from src.services.usage_service import usage_service


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


class AuthService:
    def __init__(self) -> None:
        init_db()

    def register(self, email: str, password: str, name: str | None = None) -> tuple[str, str]:
        email = email.strip().lower()
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters.")
        with get_session() as session:
            if session.query(UserRow).filter(UserRow.email == email).first():
                raise ValueError("An account with this email already exists.")

            user_id = str(uuid.uuid4())
            session.add(
                UserRow(
                    id=user_id,
                    email=email,
                    password_hash=_hash_password(password),
                    name=name,
                )
            )
            session.commit()

        account = usage_service.get_account(user_id)
        account.email = email
        usage_service.save_account(account)

        profile = CandidateProfile(id=user_id, contact=ContactInfo(name=name, email=email))
        data_store.save_profile(profile)

        return user_id, self.create_token(user_id, email)

    def login(self, email: str, password: str) -> tuple[str, str]:
        email = email.strip().lower()
        with get_session() as session:
            row = session.query(UserRow).filter(UserRow.email == email).first()
            if not row or not _verify_password(password, row.password_hash):
                raise ValueError("Invalid email or password.")
            return row.id, self.create_token(row.id, row.email)

    def get_user_email(self, user_id: str) -> str | None:
        with get_session() as session:
            row = session.get(UserRow, user_id)
            return row.email if row else None

    def create_token(self, user_id: str, email: str) -> str:
        payload = {
            "sub": user_id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(hours=settings.jwt_expire_hours),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

    def decode_token(self, token: str) -> str:
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            user_id = payload.get("sub")
            if not user_id:
                raise ValueError("Invalid token")
            return user_id
        except jwt.PyJWTError as exc:
            raise ValueError("Invalid or expired token") from exc


auth_service = AuthService()
