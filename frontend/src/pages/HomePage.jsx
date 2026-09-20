import { useState, useEffect } from 'react'

function HomePage() {
  // Estado para guardar la lista de libros que lleguen de la API.
  // Empieza como array vacío porque aún no hay datos.
  const [books, setBooks] = useState([])

  // Estado para saber si la petición sigue en curso (útil para mostrar "Cargando...").
  const [loading, setLoading] = useState(true)

  // Estado para guardar un posible mensaje de error (null = sin error).
  const [error, setError] = useState(null)

  // TEMPORAL: token pegado a mano desde Swagger, solo para probar la conexión.
  // Esto se sustituirá por el token real guardado tras el login.
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcnVlYmFAZ21haWwuY29tIiwiZXhwIjoxNzg5ODk4MjIzfQ.zXPBV0rJK7JdzpdNUKYOavgCKKllIfKbxYcO6WpDi-s'

  useEffect(() => {
    // Función async separada porque useEffect no puede recibir
    // directamente una función async como callback.
    async function fetchBooks() {
      try {
        const response = await fetch('http://localhost:8000/books', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status} al pedir los libros`)
        }

        const data = await response.json()
        setBooks(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, []) // array vacío = ejecutar solo una vez, al montar el componente

  if (loading) return <p>Cargando libros...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>Mis libros</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            {book.title} — {book.author}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomePage