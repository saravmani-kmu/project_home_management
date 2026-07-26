from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import schemas, utils
from app.auth.dependencies import get_current_member
from app.auth.jwt import (
    InvalidTokenError,
    create_pending_token,
    create_session_token,
    decode_pending_token,
)
from app.auth.oauth import oauth
from app.config import settings
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.household import Household

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _is_allowed_mobile_redirect(redirect_uri: str) -> bool:
    # Built app (production/dev-client) uses the registered custom scheme.
    if redirect_uri.startswith(settings.mobile_scheme):
        return True
    # Expo Go during development uses an exp:// tunnel/LAN URL instead of the
    # app's own scheme, so it can't be pinned to a single fixed value — only
    # constrain the scheme itself to avoid becoming an open redirect.
    if redirect_uri.startswith("exp://") or redirect_uri.startswith("exp+"):
        return True
    return False


@router.get("/google/login")
async def google_login(
    request: Request,
    intent: str = "login",
    platform: str = "web",
    redirect_uri: str | None = None,
):
    request.session["oauth_intent"] = "signup" if intent == "signup" else "login"
    is_mobile = platform == "mobile"
    request.session["oauth_platform"] = "mobile" if is_mobile else "web"

    if is_mobile:
        if not redirect_uri or not _is_allowed_mobile_redirect(redirect_uri):
            raise HTTPException(status_code=400, detail="Invalid or missing redirect_uri")
        request.session["oauth_mobile_redirect"] = redirect_uri

    return await oauth.google.authorize_redirect(request, settings.google_redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Google sign-in failed: {exc}")

    userinfo = token.get("userinfo")
    if not userinfo or not userinfo.get("email"):
        raise HTTPException(status_code=401, detail="Google did not return an email address")

    email = userinfo["email"]
    name = userinfo.get("name") or email.split("@")[0]
    picture = userinfo.get("picture")

    is_mobile = request.session.get("oauth_platform") == "mobile"
    if is_mobile:
        callback_base = request.session.get("oauth_mobile_redirect")
        if not callback_base or not _is_allowed_mobile_redirect(callback_base):
            raise HTTPException(status_code=400, detail="Missing or invalid mobile redirect")
    else:
        callback_base = f"{settings.frontend_base_url}/auth/callback"

    member = db.query(FamilyMember).filter(FamilyMember.google_email == email).one_or_none()

    if member is not None:
        session_token = create_session_token(member.id)
        return RedirectResponse(f"{callback_base}#token={session_token}")

    # No account for this Google email yet — regardless of whether the user clicked
    # Login or Sign up, send them to onboarding to create their household.
    pending_token = create_pending_token(email, name, picture)
    return RedirectResponse(f"{callback_base}#pending={pending_token}")


@router.post("/onboarding", response_model=schemas.OnboardingResult, status_code=201)
def complete_onboarding(payload: schemas.OnboardingInput, db: Session = Depends(get_db)):
    try:
        claims = decode_pending_token(payload.pending_token)
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Your sign-in has expired, please try again")

    existing = (
        db.query(FamilyMember).filter(FamilyMember.google_email == claims["email"]).one_or_none()
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="An account already exists for this email")

    admin_name = payload.name.strip() or claims["name"] or claims["email"].split("@")[0]

    household = Household(id=utils.new_id("hh"), name=payload.family_name.strip())
    db.add(household)
    db.flush()

    member = FamilyMember(
        id=utils.new_id("mem"),
        household_id=household.id,
        name=admin_name,
        role="admin",
        color=utils.color_for_index(0),
        avatar_initials=utils.initials_from_name(admin_name),
        relationship_type="other",
        relationship_other="Admin",
        google_email=claims["email"],
        google_picture=claims["picture"],
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    member_out = schemas.FamilyMemberOut.model_validate(member)
    member_out.has_invite = False
    return schemas.OnboardingResult(
        member=member_out, session_token=create_session_token(member.id)
    )


@router.get("/me", response_model=schemas.FamilyMemberOut)
def get_me(current_member: FamilyMember = Depends(get_current_member)):
    out = schemas.FamilyMemberOut.model_validate(current_member)
    out.has_invite = current_member.invite is not None
    return out
