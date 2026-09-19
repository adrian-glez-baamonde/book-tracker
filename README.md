# Book Tracker

App full-stack para llevar el registro de tus lecturas: biblioteca personal con progreso de lectura, portadas automáticas vía Open Library API y autenticación de usuarios.

## Tecnologías

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite, pytest
- **Frontend:** React, Tailwind CSS

## Estado del proyecto

🚧 En desarrollo — MVP en construcción.

- ✅ Backend: completo y testeado (auth, CRUD de libros, búsqueda por Open Library, estadísticas)
- ⬜ Frontend: pendiente de empezar

## Funcionalidades

- Registro y login de usuarios (autenticación con JWT)
- Añadir, editar, consultar y eliminar libros de tu biblioteca
- Estados de lectura: por leer / leyendo / leído
- Seguimiento de página actual y progreso de lectura
- Búsqueda de libros por título usando la API de Open Library, con autor y portada
- Estadísticas de lectura: total de libros, libros por estado, páginas leídas, progreso medio

## Estructura del proyecto

Backend y frontend viven en el mismo repositorio (decisión deliberada: más simple para un proyecto en solitario).

```
BookTracker/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py       # configuración de la base de datos (Base, get_db)
│   │   ├── models.py         # modelos de SQLAlchemy (User, Book)
│   │   ├── schemas.py        # esquemas de Pydantic
│   │   ├── security.py       # hashing de contraseñas, JWT, autenticación
│   │   ├── routers/
│   │   │   ├── auth.py       # /register, /login
│   │   │   └── books.py      # CRUD de libros, búsqueda, estadísticas
│   │   └── services/
│   │       └── open_library.py   # integración con la API de Open Library
│   ├── tests/                 # suite de tests (pytest)
│   ├── .env                   # variables de entorno (no se sube a git)
│   └── pyproject.toml
├── frontend/                  # creada, pendiente de empezar
└── .gitignore                 # Python + Node combinado
```

## Backend

### Requisitos

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) como gestor de paquetes y entornos

### Variables de entorno

Crear un archivo `backend/.env` (no se versiona) con:

```
SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Instalación y arranque

```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

La API quedará disponible en `http://localhost:8000`. Documentación interactiva (Swagger) en `http://localhost:8000/docs`.

> **Nota:** `bcrypt` está fijado a la versión `4.0.1` por una incompatibilidad conocida con `passlib` en versiones más recientes (sin este pin, el hasheo falla con "password cannot be longer than 72 bytes").

### Tests

```powershell
cd backend
uv run pytest
```

Suite actual: 20 tests, cubriendo autenticación, CRUD de libros con control de propiedad (ownership), búsqueda con Open Library mockeada y estadísticas.

### Endpoints principales

| Método | Ruta                | Descripción                                       | Auth |
|--------|---------------------|----------------------------------------------------|:----:|
| POST   | `/register`         | Registro de usuario                                | ❌   |
| POST   | `/login`             | Login, devuelve access token (JWT)                 | ❌   |
| POST   | `/books`             | Crear un libro en la biblioteca del usuario        | ✅   |
| GET    | `/books`             | Listar libros del usuario (filtrable por estado)   | ✅   |
| GET    | `/books/search`      | Buscar libros por título (Open Library)            | ✅   |
| GET    | `/books/{book_id}`   | Consultar un libro                                 | ✅   |
| PATCH  | `/books/{book_id}`   | Actualizar un libro                                | ✅   |
| DELETE | `/books/{book_id}`   | Eliminar un libro                                  | ✅   |
| GET    | `/stats`             | Estadísticas de lectura del usuario                | ✅   |

## Frontend (próximamente)

Carpeta `frontend/` ya creada, pendiente de implementar en React + Tailwind CSS. Se documentará aquí una vez arrancado:

- [ ] Estructura de carpetas del frontend
- [ ] Instrucciones de instalación y arranque
- [ ] Configuración de CORS en el backend (FastAPI) para aceptar peticiones desde el frontend
- [ ] Autenticación en frontend (guardar/enviar JWT, proteger rutas)
- [ ] Flujo de integración de la búsqueda de Open Library en la UI (por decidir: desplegable de resultados vs. autofill tipo gestor de contraseñas)
- [ ] Capturas de pantalla / demo

## Pendiente / roadmap futuro (más allá del MVP)

- Refresh tokens (actualmente solo access token)
- Migraciones con Alembic
- Normalizar email a minúsculas en registro/login
- Tipar `status_filter` en `GET /books` como Enum en vez de `str`

## Roadmap

- [x] Backend: autenticación
- [x] Backend: CRUD de libros
- [x] Backend: integración con Open Library
- [x] Backend: estadísticas
- [ ] Frontend en React
- [ ] Despliegue
