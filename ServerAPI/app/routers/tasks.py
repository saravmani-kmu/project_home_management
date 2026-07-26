from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas, utils
from app.auth.dependencies import get_current_member, require_admin
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.task import Task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _apply_task_fields(task: Task, payload: schemas.TaskBase) -> None:
    task.title = payload.title.strip()
    task.description = payload.description
    task.assignee_id = payload.assignee_id
    task.priority = payload.priority
    task.status = payload.status
    task.category = payload.category
    task.due_at = payload.due_at
    task.reminder_enabled = payload.reminder.enabled
    task.reminder_remind_at = payload.reminder.remind_at
    task.reminder_frequency = payload.reminder.frequency


def _get_member_in_household(member_id: str, household_id: str, db: Session) -> FamilyMember:
    member = (
        db.query(FamilyMember)
        .filter(FamilyMember.id == member_id, FamilyMember.household_id == household_id)
        .one_or_none()
    )
    if member is None:
        raise HTTPException(
            status_code=422, detail=f"Family member '{member_id}' does not exist in this household"
        )
    return member


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    return (
        db.query(Task)
        .join(FamilyMember, Task.assignee_id == FamilyMember.id)
        .filter(FamilyMember.household_id == current.household_id)
        .order_by(Task.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    _get_member_in_household(payload.assignee_id, current.household_id, db)
    _get_member_in_household(payload.created_by_id, current.household_id, db)

    task = Task(id=utils.new_id("task"), created_by_id=payload.created_by_id)
    _apply_task_fields(task, payload)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def _get_task_in_household_or_404(task_id: str, household_id: str, db: Session) -> Task:
    task = (
        db.query(Task)
        .join(FamilyMember, Task.assignee_id == FamilyMember.id)
        .filter(Task.id == task_id, FamilyMember.household_id == household_id)
        .one_or_none()
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    return _get_task_in_household_or_404(task_id, current.household_id, db)


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: str,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    task = _get_task_in_household_or_404(task_id, current.household_id, db)
    _get_member_in_household(payload.assignee_id, current.household_id, db)
    _apply_task_fields(task, payload)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current: FamilyMember = Depends(get_current_member),
):
    task = _get_task_in_household_or_404(task_id, current.household_id, db)
    db.delete(task)
    db.commit()


@router.post("/{task_id}/send-reminder")
def send_reminder(
    task_id: str,
    db: Session = Depends(get_db),
    admin: FamilyMember = Depends(require_admin),
):
    task = _get_task_in_household_or_404(task_id, admin.household_id, db)
    assignee = db.get(FamilyMember, task.assignee_id)
    return {
        "task_id": task.id,
        "assignee_id": task.assignee_id,
        "assignee_name": assignee.name if assignee else None,
        "sent": True,
    }
