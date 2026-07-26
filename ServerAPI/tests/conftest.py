import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.auth.jwt import create_session_token
from app.database import Base, get_db
from app.main import app
from app.models.family_member import FamilyMember
from app.models.household import Household

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def client():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        test_client.session_factory = TestingSessionLocal
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def seed_household(client, *, name="Test Family") -> str:
    db = client.session_factory()
    try:
        household = Household(id=f"hh-seed-{name.lower().replace(' ', '-')}", name=name)
        db.add(household)
        db.commit()
        return household.id
    finally:
        db.close()


def seed_member(
    client, *, household_id: str | None = None, role="member", name="Seed Member", relationship="son"
) -> dict:
    """Insert a member directly via the DB session (bypassing admin-only create endpoint)."""
    if household_id is None:
        household_id = seed_household(client)

    db = client.session_factory()
    try:
        member = FamilyMember(
            id=f"mem-seed-{name.lower().replace(' ', '-')}",
            household_id=household_id,
            name=name,
            role=role,
            color="amber",
            avatar_initials=name[:2].upper(),
            relationship_type=relationship,
        )
        db.add(member)
        db.commit()
        db.refresh(member)
        return {"id": member.id, "name": member.name, "role": member.role, "household_id": household_id}
    finally:
        db.close()


def auth_headers(member_id: str) -> dict:
    token = create_session_token(member_id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin(client):
    return seed_member(client, role="admin", name="Meera")


@pytest.fixture()
def admin_headers(admin):
    return auth_headers(admin["id"])
