import httpx


async def search_books_by_title(title: str) -> list[dict]:
    url = "https://openlibrary.org/search.json"
    params = {"title": title, "fields": "title,author_name,cover_i,number_of_pages_median"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
    except httpx.HTTPError:
        return []

    data = response.json()
    return data["docs"]



def format_book_result(doc: dict) -> dict:
    cover_i = doc.get("cover_i")
    cover_url = f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg" if cover_i else None

    authors = doc.get("author_name", [])
    author = ", ".join(authors) if authors else "Desconocido"

    return {
        "title": doc.get("title", ""),
        "author": author,
        "cover_url": cover_url,
        "total_pages": doc.get("number_of_pages_median")
    }