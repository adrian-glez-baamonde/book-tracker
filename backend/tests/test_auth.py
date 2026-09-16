def test_register_user_success(client):
    response = client.post(
        "/register",
        json={"email": "nuevo@mail.com", "password": "otracontraseña123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "nuevo@mail.com"