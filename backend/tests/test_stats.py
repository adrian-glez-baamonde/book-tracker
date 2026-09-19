def test_stats_unauthorized_fails(client):
    response = client.get("/stats")
    assert response.status_code == 401


def test_get_stats_success(client, auth_headers, test_book, test_book_reading, test_book_read):
    response = client.get("/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_books"] == 3
    assert data["to_read_count"] == 1
    assert data["reading_count"] == 1
    assert data["read_count"] == 1
    assert data["total_pages_read"] == 150
    assert data["average_reading_progress"] == 25.0


def test_get_stats_only_own_books(client, auth_headers, test_book, other_book, other_book_reading, other_book_read):
    response = client.get("/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_books"] == 1
    assert data["to_read_count"] == 1
    assert data["reading_count"] == 0
    assert data["read_count"] == 0
    assert data["total_pages_read"] == 0
    assert data["average_reading_progress"] is None


def test_get_stats_book_reading_without_total_pages(client, auth_headers, test_book_reading_without_total_pages):
    response = client.get("/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_books"] == 1
    assert data["to_read_count"] == 0
    assert data["reading_count"] == 1
    assert data["read_count"] == 0
    assert data["total_pages_read"] == 100
    assert data["average_reading_progress"] is None