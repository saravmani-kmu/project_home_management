from tests.conftest import auth_headers, seed_member


def create_task(client, headers, assignee_id, created_by_id, **overrides):
    payload = {
        "title": "Test task",
        "description": "",
        "assignee_id": assignee_id,
        "created_by_id": created_by_id,
        "priority": "medium",
        "status": "todo",
        "category": "chores",
        "due_at": None,
        "reminder": {"enabled": False, "remind_at": None, "frequency": "none"},
    }
    payload.update(overrides)
    return client.post("/api/tasks", json=payload, headers=headers)


def test_create_task(client, admin, admin_headers):
    member = seed_member(
        client, household_id=admin["household_id"], name="Arjun", relationship="husband"
    )

    response = create_task(client, admin_headers, member["id"], admin["id"], title="Take out trash")
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Take out trash"
    assert body["assignee_id"] == member["id"]
    assert body["reminder"] == {"enabled": False, "remind_at": None, "frequency": "none"}


def test_create_task_with_reminder(client, admin, admin_headers):
    response = create_task(
        client,
        admin_headers,
        admin["id"],
        admin["id"],
        reminder={"enabled": True, "remind_at": "2026-08-01T09:00:00", "frequency": "weekly"},
    )
    assert response.status_code == 201
    reminder = response.json()["reminder"]
    assert reminder["enabled"] is True
    assert reminder["frequency"] == "weekly"


def test_create_task_unknown_assignee_422(client, admin, admin_headers):
    response = create_task(client, admin_headers, "does-not-exist", admin["id"])
    assert response.status_code == 422


def test_create_task_requires_auth(client, admin):
    response = create_task(client, None, admin["id"], admin["id"])
    assert response.status_code == 401


def test_list_and_update_task(client, admin, admin_headers):
    member = seed_member(
        client, household_id=admin["household_id"], name="Arjun", relationship="husband"
    )
    task = create_task(client, admin_headers, member["id"], admin["id"]).json()

    response = client.put(
        f"/api/tasks/{task['id']}",
        json={
            "title": "Updated title",
            "description": "updated",
            "assignee_id": admin["id"],
            "priority": "high",
            "status": "in_progress",
            "category": "bills",
            "due_at": None,
            "reminder": {"enabled": False, "remind_at": None, "frequency": "none"},
        },
        headers=admin_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Updated title"
    assert body["assignee_id"] == admin["id"]
    assert body["status"] == "in_progress"

    listed = client.get("/api/tasks", headers=admin_headers).json()
    assert len(listed) == 1


def test_delete_task(client, admin, admin_headers):
    task = create_task(client, admin_headers, admin["id"], admin["id"]).json()

    response = client.delete(f"/api/tasks/{task['id']}", headers=admin_headers)
    assert response.status_code == 204
    assert client.get(f"/api/tasks/{task['id']}", headers=admin_headers).status_code == 404


def test_send_reminder_as_admin_succeeds(client, admin, admin_headers):
    member = seed_member(
        client, household_id=admin["household_id"], name="Arjun", relationship="husband"
    )
    task = create_task(client, admin_headers, member["id"], admin["id"]).json()

    response = client.post(f"/api/tasks/{task['id']}/send-reminder", headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["sent"] is True
    assert body["assignee_name"] == "Arjun"


def test_send_reminder_as_non_admin_forbidden(client, admin, admin_headers):
    member = seed_member(
        client, household_id=admin["household_id"], name="Arjun", relationship="husband"
    )
    task = create_task(client, admin_headers, member["id"], admin["id"]).json()

    response = client.post(
        f"/api/tasks/{task['id']}/send-reminder", headers=auth_headers(member["id"])
    )
    assert response.status_code == 403


def test_send_reminder_requires_auth(client, admin, admin_headers):
    task = create_task(client, admin_headers, admin["id"], admin["id"]).json()
    response = client.post(f"/api/tasks/{task['id']}/send-reminder")
    assert response.status_code == 401


def test_send_reminder_missing_task_404(client, admin_headers):
    response = client.post(
        "/api/tasks/does-not-exist/send-reminder", headers=admin_headers
    )
    assert response.status_code == 404
