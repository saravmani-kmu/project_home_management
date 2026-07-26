from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    assignee_id: Mapped[str] = mapped_column(
        String, ForeignKey("family_members.id"), nullable=False
    )
    created_by_id: Mapped[str] = mapped_column(
        String, ForeignKey("family_members.id"), nullable=False
    )
    priority: Mapped[str] = mapped_column(String, nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String, nullable=False, default="todo")
    category: Mapped[str] = mapped_column(String, nullable=False, default="other")
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    reminder_remind_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reminder_frequency: Mapped[str] = mapped_column(String, nullable=False, default="none")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    assignee: Mapped["FamilyMember"] = relationship(
        "FamilyMember", back_populates="assigned_tasks", foreign_keys=[assignee_id]
    )
