def test_create_book_success(client, auth_headers, test_user):
    response = client.post(
        "/books",
        json={
            "title": "Libro Prueba",
            "author": "Anónimo",
            "status": "to-read"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Libro Prueba"
    assert data["owner_id"] == test_user.id


def test_create_book_unauthorized_fails(client):
    response = client.post(
        "/books",
        json={
            "title": "Libro Prueba",
            "author": "Anónimo",
            "status": "to-read"
        }
    )
    assert response.status_code == 401


def test_list_books_only_own(client, auth_headers, test_book, other_book):
    response = client.get("/books", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    book_ids = [book["id"] for book in data]

    assert test_book.id in book_ids
    assert other_book.id not in book_ids


def test_get_book_other_user_fails(client, auth_headers, other_book):
    response = client.get(f"/books/{other_book.id}", headers=auth_headers)
    assert response.status_code == 404


def test_update_book_current_page(client, auth_headers, test_book):
    response = client.patch(
        f"/books/{test_book.id}",
        json={"current_page": 150},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_page"] == 150
    assert data["status"] == "to-read"


def test_update_book_status_read_sets_current_page_to_total(client, auth_headers, test_book):
    response = client.patch(
        f"/books/{test_book.id}",
        json={"status": "read"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_page"] == 300
    assert data["status"] == "read"


def test_update_book_other_user_fails(client, auth_headers, other_book):
    response = client.patch(
        f"/books/{other_book.id}",
        json={"current_page": 150}, 
        headers=auth_headers
    )
    assert response.status_code == 404


def test_delete_book_success(client, auth_headers, test_book):
    response = client.delete(
        f"/books/{test_book.id}",
        headers=auth_headers
    )
    assert response.status_code == 200


def test_delete_book_other_users_fails(client, auth_headers, other_book):
    response = client.delete(
        f"/books/{other_book.id}",
        headers=auth_headers
    )
    assert response.status_code == 404