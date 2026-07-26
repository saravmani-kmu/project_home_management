from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.jwt import InvalidTokenError, decode_session_token
from app.database import get_db
from app.models.family_member import FamilyMember

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_member(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> FamilyMember:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        member_id = decode_session_token(credentials.credentials)
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    member = db.get(FamilyMember, member_id)
    if member is None:
        raise HTTPException(status_code=401, detail="Account no longer exists")
    return member


def require_admin(member: FamilyMember = Depends(get_current_member)) -> FamilyMember:
    if member.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return member
