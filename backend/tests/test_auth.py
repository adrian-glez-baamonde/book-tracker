def test_register_user_success(client):
    response = client.post(
        "/register",
        json={"email": "nuevo@mail.com", "password": "otracontraseña123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "nuevo@mail.com"


def test_register_duplicate_email_fails(client, test_user):
    response = client.post(
        "/register",
        json={"email": test_user.email, "password": "otracontraseña123"}
    )
    assert response.status_code == 409


def test_login_success(client, test_user):
    response = client.post(
        "/login",
        data={"username": test_user.email, "password": "contraseña123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_wrong_password_fails(client, test_user):
    response = client.post(
        "/login",
        data={"username": test_user.email, "password": "contraseña12345"}
    )
    assert response.status_code == 401