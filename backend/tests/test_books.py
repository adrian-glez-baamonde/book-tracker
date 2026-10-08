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


def test_create_book_to_read_with_pages_sets_reading(client, auth_headers):
    response = client.post(
        "/books",
        json={
            "title": "Libro Prueba",
            "author": "Anónimo",
            "status": "to-read",
            "current_page": 50,
            "total_pages": 300
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "reading"
    assert data["current_page"] == 50


def test_create_book_with_current_page_equal_to_total_sets_read(client, auth_headers):
    response = client.post(
        "/books",
        json={
            "title": "Libro Prueba",
            "author": "Anónimo",
            "status": "reading",
            "current_page": 300,
            "total_pages": 300
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "read"
    assert data["current_page"] == 300


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


def test_update_current_page_on_to_read_book_sets_reading(client, auth_headers, test_book):
    response = client.patch(
        f"/books/{test_book.id}",
        json={"current_page": 150},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_page"] == 150
    assert data["status"] == "reading"


def test_update_current_page_to_total_sets_read(client, auth_headers, test_book_reading):
    response = client.patch(
        f"/books/{test_book_reading.id}",
        json={"current_page": 600},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_page"] == 600
    assert data["status"] == "read"


def test_update_current_page_above_total_fails(client, auth_headers, test_book_reading):
    response = client.patch(
        f"/books/{test_book_reading.id}",
        json={"current_page": 601},
        headers=auth_headers
    )
    assert response.status_code == 422


def test_explicit_status_wins_over_automatic_transition(client, auth_headers, test_book_reading):
    response = client.patch(
        f"/books/{test_book_reading.id}",
        json={"current_page": 600, "status": "reading"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_page"] == 600
    assert data["status"] == "reading"


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


def test_update_status_read_without_total_keeps_current_page(
    client, auth_headers, test_book_reading_without_total_pages
):
    response = client.patch(
        f"/books/{test_book_reading_without_total_pages.id}",
        json={"status": "read"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "read"
    assert data["current_page"] == 100
    assert data["total_pages"] is None


def test_update_status_from_read_to_reading_keeps_current_page(client, auth_headers, test_book):
    client.patch(f"/books/{test_book.id}", json={"status": "read"}, headers=auth_headers)

    response = client.patch(
        f"/books/{test_book.id}",
        json={"status": "reading"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reading"
    assert data["current_page"] == 300


def test_update_status_from_read_to_to_read_resets_current_page(client, auth_headers, test_book):
    client.patch(f"/books/{test_book.id}", json={"status": "read"}, headers=auth_headers)

    response = client.patch(
        f"/books/{test_book.id}",
        json={"status": "to-read"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "to-read"
    assert data["current_page"] == 0


def test_update_current_page_below_total_on_read_book_sets_reading(client, auth_headers, test_book):
    client.patch(f"/books/{test_book.id}", json={"status": "read"}, headers=auth_headers)

    response = client.patch(
        f"/books/{test_book.id}",
        json={"current_page": 200},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reading"
    assert data["current_page"] == 200


def test_update_other_field_does_not_trigger_automatic_transition(client, auth_headers, test_book):
    client.patch(f"/books/{test_book.id}", json={"status": "read"}, headers=auth_headers)
    client.patch(f"/books/{test_book.id}", json={"status": "reading"}, headers=auth_headers)

    response = client.patch(
        f"/books/{test_book.id}",
        json={"title": "Título Corregido"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Título Corregido"
    assert data["status"] == "reading"
    assert data["current_page"] == 300


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


def test_search_books_mocked(client, auth_headers, monkeypatch):
    async def fake_search(title: str) -> list[dict]:
        return [
            {
                "title": "Mistborn",
                "author_name": ["Brandon Sanderson"],
                "cover_i": 12345,
                "number_of_pages_median": 688
            }
        ]

    monkeypatch.setattr("app.routers.books.search_books_by_title", fake_search)

    response = client.get("/books/search?title=mitborn", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data[0]["title"] == "Mistborn"
    assert data[0]["author"] == "Brandon Sanderson"
    assert data[0]["cover_url"] == "https://covers.openlibrary.org/b/id/12345-M.jpg"


def test_search_books_no_results(client, auth_headers, monkeypatch):
    async def fake_search(title: str) -> list[dict]:
        return []

    monkeypatch.setattr("app.routers.books.search_books_by_title", fake_search)

    response = client.get("/books/search?title=mistborn", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data == []


def test_search_books_unauthorized_fails(client):
    response = client.get("/books/search?title=mistborn")
    assert response.status_code == 401