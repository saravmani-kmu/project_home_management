from datetime import datetime, timedelta, timezone
from typing import Literal, TypedDict

from jose import JWTError, jwt

from app.config import settings


class InvalidTokenError(Exception):
    pass


class PendingClaims(TypedDict):
    email: str
    name: str
    picture: str | None


def _encode(payload: dict, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    full_payload = {**payload, "iat": now, "exp": now + timedelta(minutes=expires_minutes)}
    return jwt.encode(full_payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise InvalidTokenError(str(exc)) from exc


def create_session_token(member_id: str) -> str:
    return _encode({"type": "session", "sub": member_id}, settings.jwt_expires_minutes)


def decode_session_token(token: str) -> str:
    payload = _decode(token)
    if payload.get("type") != "session" or not payload.get("sub"):
        raise InvalidTokenError("Not a valid session token")
    return payload["sub"]


PENDING_TOKEN_EXPIRES_MINUTES = 15


def create_pending_token(email: str, name: str, picture: str | None) -> str:
    return _encode(
        {"type": "pending", "email": email, "name": name, "picture": picture},
        PENDING_TOKEN_EXPIRES_MINUTES,
    )


def decode_pending_token(token: str) -> PendingClaims:
    payload = _decode(token)
    if payload.get("type") != "pending" or not payload.get("email"):
        raise InvalidTokenError("Not a valid pending token")
    return PendingClaims(
        email=payload["email"], name=payload.get("name", ""), picture=payload.get("picture")
    )
