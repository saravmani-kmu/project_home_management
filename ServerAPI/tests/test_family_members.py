from tests.conftest import auth_headers


def create_member(client, admin_headers, **overrides):
    payload = {
        "name": "Test Member",
        "role": "member",
        "relationship": "son",
        "relationship_other": None,
    }
    payload.update(overrides)
    response = client.post("/api/members", json=payload, headers=admin_headers)
    assert response.status_code == 201
    return response.json()


def test_create_and_list_members(client, admin_headers, admin):
    member = create_member(client, admin_headers, name="Arjun", relationship="husband")
    assert member["name"] == "Arjun"
    assert member["relationship"] == "husband"
    assert member["avatar_initials"] == "AR"
    assert member["color"] == "teal"  # admin (seeded first) already took "amber"

    response = client.get("/api/members", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2  # seeded admin + new member


def test_create_member_requires_admin(client):
    response = client.post(
        "/api/members",
        json={"name": "X", "role": "member", "relationship": "son", "relationship_other": None},
    )
    assert response.status_code == 401


def test_create_member_forbidden_for_non_admin(client, admin_headers):
    member = create_member(client, admin_headers, name="Priya", relationship="daughter")

    response = client.post(
        "/api/members",
        json={"name": "X", "role": "member", "relationship": "son", "relationship_other": None},
        headers=auth_headers(member["id"]),
    )
    assert response.status_code == 403


def test_color_rotates_across_members(client, admin_headers):
    colors = [
        create_member(client, admin_headers, name=f"Member {i}")["color"] for i in range(7)
    ]
    # index 0 is the second member created (index 0 after the seeded admin took "amber")
    assert colors[:5] == ["teal", "rose", "violet", "sky", "lime"]
    assert colors[5] == "amber"


def test_relationship_other_requires_text(client, admin_headers):
    response = client.post(
        "/api/members",
        json={"name": "X", "role": "member", "relationship": "other", "relationship_other": ""},
        headers=admin_headers,
    )
    assert response.status_code == 422


def test_update_member(client, admin_headers):
    member = create_member(
        client, admin_headers, name="Ravi", relationship="other", relationship_other="Uncle"
    )

    response = client.put(
        f"/api/members/{member['id']}",
        json={
            "name": "Ravindra",
            "role": "member",
            "relationship": "father",
            "relationship_other": None,
        },
        headers=admin_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Ravindra"
    assert body["relationship"] == "father"
    assert body["relationship_other"] is None
    assert body["avatar_initials"] == "RA"


def test_update_missing_member_404(client, admin_headers):
    response = client.put(
        "/api/members/does-not-exist",
        json={"name": "X", "role": "member", "relationship": "son", "relationship_other": None},
        headers=admin_headers,
    )
    assert response.status_code == 404


def test_delete_member(client, admin_headers):
    member = create_member(client, admin_headers)
    response = client.delete(f"/api/members/{member['id']}", headers=admin_headers)
    assert response.status_code == 204
    assert client.get(f"/api/members/{member['id']}", headers=admin_headers).status_code == 404


def test_generate_and_get_invite(client, admin_headers):
    member = create_member(client, admin_headers)

    response = client.post(f"/api/members/{member['id']}/invite", headers=admin_headers)
    assert response.status_code == 200
    first_token = response.json()["token"]
    assert len(first_token) == 8

    response = client.get(f"/api/members/{member['id']}/invite", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["token"] == first_token


def test_generate_invite_requires_admin(client, admin_headers):
    member = create_member(client, admin_headers)
    response = client.post(f"/api/members/{member['id']}/invite")
    assert response.status_code == 401


def test_regenerate_invite_changes_token(client, admin_headers):
    member = create_member(client, admin_headers)
    first = client.post(f"/api/members/{member['id']}/invite", headers=admin_headers).json()["token"]
    second = client.post(f"/api/members/{member['id']}/invite", headers=admin_headers).json()["token"]
    assert first != second


def test_get_invite_before_generation_404(client, admin_headers):
    member = create_member(client, admin_headers)
    response = client.get(f"/api/members/{member['id']}/invite", headers=admin_headers)
    assert response.status_code == 404
