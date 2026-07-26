from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    household_id: Mapped[str] = mapped_column(String, ForeignKey("households.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="member")
    color: Mapped[str] = mapped_column(String, nullable=False)
    avatar_initials: Mapped[str] = mapped_column(String, nullable=False)
    relationship_type: Mapped[str] = mapped_column("relationship", String, nullable=False)
    relationship_other: Mapped[str | None] = mapped_column(String, nullable=True)
    google_email: Mapped[str | None] = mapped_column(String, nullable=True, unique=True)
    google_picture: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    household: Mapped["Household"] = relationship("Household", back_populates="members")
    invite: Mapped["MemberInvite | None"] = relationship(
        "MemberInvite", back_populates="member", uselist=False, cascade="all, delete-orphan"
    )
    assigned_tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="assignee",
        foreign_keys="Task.assignee_id",
    )
