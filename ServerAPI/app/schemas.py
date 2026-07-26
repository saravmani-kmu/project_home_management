from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

MemberRole = Literal["admin", "member"]
MemberColor = Literal["amber", "teal", "rose", "violet", "sky", "lime"]
RelationshipType = Literal[
    "wife",
    "husband",
    "son",
    "daughter",
    "mother",
    "father",
    "grandmother",
    "grandfather",
    "other",
]
TaskPriority = Literal["low", "medium", "high"]
TaskStatus = Literal["todo", "in_progress", "done"]
TaskCategory = Literal["chores", "bills", "shopping", "maintenance", "other"]
ReminderFrequency = Literal["none", "daily", "weekly", "monthly"]


class TaskReminder(BaseModel):
    enabled: bool = False
    remind_at: datetime | None = None
    frequency: ReminderFrequency = "none"


class FamilyMemberBase(BaseModel):
    name: str = Field(min_length=1)
    role: MemberRole = "member"
    relationship_type: RelationshipType = Field(alias="relationship")
    relationship_other: str | None = None

    model_config = ConfigDict(populate_by_name=True)

    @model_validator(mode="after")
    def validate_other(self):
        if self.relationship_type == "other" and not (self.relationship_other or "").strip():
            raise ValueError("relationship_other is required when relationship is 'other'")
        return self


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMemberUpdate(FamilyMemberBase):
    pass


class FamilyMemberOut(BaseModel):
    id: str
    name: str
    role: MemberRole
    color: MemberColor
    avatar_initials: str
    relationship_type: RelationshipType = Field(serialization_alias="relationship")
    relationship_other: str | None
    has_invite: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class MemberInviteOut(BaseModel):
    token: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OnboardingInput(BaseModel):
    pending_token: str
    name: str = Field(min_length=1)
    family_name: str = Field(min_length=1)


class OnboardingResult(BaseModel):
    member: FamilyMemberOut
    session_token: str


class TaskBase(BaseModel):
    title: str = Field(min_length=1)
    description: str = ""
    assignee_id: str
    priority: TaskPriority = "medium"
    status: TaskStatus = "todo"
    category: TaskCategory = "other"
    due_at: datetime | None = None
    reminder: TaskReminder = TaskReminder()


class TaskCreate(TaskBase):
    created_by_id: str


class TaskUpdate(TaskBase):
    pass


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    assignee_id: str
    created_by_id: str
    priority: TaskPriority
    status: TaskStatus
    category: TaskCategory
    due_at: datetime | None
    reminder: TaskReminder
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def assemble_reminder(cls, data):
        if hasattr(data, "reminder_enabled"):
            return {
                "id": data.id,
                "title": data.title,
                "description": data.description,
                "assignee_id": data.assignee_id,
                "created_by_id": data.created_by_id,
                "priority": data.priority,
                "status": data.status,
                "category": data.category,
                "due_at": data.due_at,
                "reminder": TaskReminder(
                    enabled=data.reminder_enabled,
                    remind_at=data.reminder_remind_at,
                    frequency=data.reminder_frequency,
                ),
                "created_at": data.created_at,
            }
        return data
