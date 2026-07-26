def test_me_requires_auth(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_returns_current_admin(client, admin, admin_headers):
    response = client.get("/api/auth/me", headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == admin["id"]
    assert body["role"] == "admin"


def test_me_rejects_garbage_token(client):
    response = client.get(
        "/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401


def test_google_login_redirects_to_google(client):
    response = client.get("/api/auth/google/login", follow_redirects=False)
    assert response.status_code in (302, 307)
    assert "accounts.google.com" in response.headers["location"]


def test_google_login_mobile_requires_redirect_uri(client):
    response = client.get(
        "/api/auth/google/login", params={"platform": "mobile"}, follow_redirects=False
    )
    assert response.status_code == 400


def test_google_login_mobile_rejects_untrusted_redirect_uri(client):
    response = client.get(
        "/api/auth/google/login",
        params={"platform": "mobile", "redirect_uri": "https://evil.example.com/steal"},
        follow_redirects=False,
    )
    assert response.status_code == 400


def test_google_login_mobile_accepts_scheme_redirect(client):
    response = client.get(
        "/api/auth/google/login",
        params={"platform": "mobile", "redirect_uri": "hearth://auth/callback"},
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "accounts.google.com" in response.headers["location"]


def test_google_login_mobile_accepts_expo_go_redirect(client):
    response = client.get(
        "/api/auth/google/login",
        params={
            "platform": "mobile",
            "redirect_uri": "exp://192.168.1.5:8081/--/auth/callback",
        },
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "accounts.google.com" in response.headers["location"]


def test_onboarding_creates_household_and_admin(client):
    from app.auth.jwt import create_pending_token

    pending = create_pending_token("newadmin@example.com", "Meera", None)

    response = client.post(
        "/api/auth/onboarding",
        json={"pending_token": pending, "name": "Meera", "family_name": "The Sharma Family"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["member"]["name"] == "Meera"
    assert body["member"]["role"] == "admin"
    assert body["session_token"]

    # the returned session token actually works
    me = client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {body['session_token']}"}
    )
    assert me.status_code == 200
    assert me.json()["id"] == body["member"]["id"]


def test_onboarding_rejects_session_token(client, admin_headers):
    response = client.post(
        "/api/auth/onboarding",
        json={
            "pending_token": admin_headers["Authorization"].removeprefix("Bearer "),
            "name": "X",
            "family_name": "Y",
        },
    )
    assert response.status_code == 401


def test_onboarding_rejects_duplicate_email(client):
    from app.auth.jwt import create_pending_token

    pending1 = create_pending_token("dup@example.com", "First", None)
    response1 = client.post(
        "/api/auth/onboarding",
        json={"pending_token": pending1, "name": "First", "family_name": "Family One"},
    )
    assert response1.status_code == 201

    pending2 = create_pending_token("dup@example.com", "Second", None)
    response2 = client.post(
        "/api/auth/onboarding",
        json={"pending_token": pending2, "name": "Second", "family_name": "Family Two"},
    )
    assert response2.status_code == 409
