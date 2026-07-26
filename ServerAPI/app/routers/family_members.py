from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import schemas, utils
from app.auth.dependencies import get_current_member, require_admin
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.member_invite import MemberInvite

router = APIRouter(prefix="/api/members", tags=["family-members"])


def _to_out(member: FamilyMember) -> schemas.FamilyMemberOut:
    out = schemas.FamilyMemberOut.model_validate(member)
    out.has_invite = member.invite is not None
    return out


@router.get("", response_model=list[schemas.FamilyMemberOut])
def list_members(
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    members = (
        db.query(FamilyMember)
        .filter(FamilyMember.household_id == current.household_id)
        .order_by(FamilyMember.created_at)
        .all()
    )
    return [_to_out(member) for member in members]


@router.post("", response_model=schemas.FamilyMemberOut, status_code=201)
def create_member(
    payload: schemas.FamilyMemberCreate,
    db: Session = Depends(get_db),
    admin: FamilyMember = Depends(require_admin),
):
    member_count = (
        db.query(func.count(FamilyMember.id))
        .filter(FamilyMember.household_id == admin.household_id)
        .scalar()
        or 0
    )
    member = FamilyMember(
        id=utils.new_id("mem"),
        household_id=admin.household_id,
        name=payload.name.strip(),
        role=payload.role,
        color=utils.color_for_index(member_count),
        avatar_initials=utils.initials_from_name(payload.name),
        relationship_type=payload.relationship_type,
        relationship_other=(payload.relationship_other or "").strip() or None,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return _to_out(member)


def _get_member_in_household_or_404(member_id: str, household_id: str, db: Session) -> FamilyMember:
    member = (
        db.query(FamilyMember)
        .filter(FamilyMember.id == member_id, FamilyMember.household_id == household_id)
        .one_or_none()
    )
    if member is None:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member


@router.get("/{member_id}", response_model=schemas.FamilyMemberOut)
def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    return _to_out(_get_member_in_household_or_404(member_id, current.household_id, db))


@router.put("/{member_id}", response_model=schemas.FamilyMemberOut)
def update_member(
    member_id: str,
    payload: schemas.FamilyMemberUpdate,
    db: Session = Depends(get_db),
    admin: FamilyMember = Depends(require_admin),
):
    member = _get_member_in_household_or_404(member_id, admin.household_id, db)
    member.name = payload.name.strip()
    member.role = payload.role
    member.avatar_initials = utils.initials_from_name(payload.name)
    member.relationship_type = payload.relationship_type
    member.relationship_other = (payload.relationship_other or "").strip() or None
    db.commit()
    db.refresh(member)
    return _to_out(member)


@router.delete("/{member_id}", status_code=204)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    admin: FamilyMember = Depends(require_admin),
):
    member = _get_member_in_household_or_404(member_id, admin.household_id, db)
    db.delete(member)
    db.commit()


@router.post("/{member_id}/invite", response_model=schemas.MemberInviteOut)
def generate_invite(
    member_id: str,
    db: Session = Depends(get_db),
    admin: FamilyMember = Depends(require_admin),
):
    member = _get_member_in_household_or_404(member_id, admin.household_id, db)
    invite = db.query(MemberInvite).filter(MemberInvite.member_id == member.id).one_or_none()
    token = utils.generate_invite_token()
    if invite is None:
        invite = MemberInvite(member_id=member.id, token=token)
        db.add(invite)
    else:
        invite.token = token
    db.commit()
    db.refresh(invite)
    return invite


@router.get("/{member_id}/invite", response_model=schemas.MemberInviteOut)
def get_invite(
    member_id: str,
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    _get_member_in_household_or_404(member_id, current.household_id, db)
    invite = db.query(MemberInvite).filter(MemberInvite.member_id == member_id).one_or_none()
    if invite is None:
        raise HTTPException(status_code=404, detail="No invite generated for this member yet")
    return invite
