import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
    setIsMenuOpen(false);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <nav className="bg-verde text-cream px-4 py-3 flex justify-between items-center relative">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-dorado" />
        <span className="font-bold text-dorado text-lg">Monfort</span>
      </div>

      <button
        className="md:hidden text-2xl cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        ></div>
      )}

      <div
        className={`${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0 fixed md:static top-0 right-0 h-screen md:h-auto w-64 md:w-auto bg-verde md:bg-transparent flex flex-col md:flex-row md:items-center gap-6 md:gap-6 px-6 md:px-0 pt-5 pb-8 md:py-0 text-lg md:text-base transition-transform duration-300 md:transition-none z-50`}
      >
        <button
          className="md:hidden self-start cursor-pointer hover:text-dorado transition-colors"
          onClick={closeMenu}
          aria-label="Cerrar menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>

        <Link
          to="/"
          onClick={closeMenu}
          className="hover:text-dorado transition-colors"
        >
          Inicio
        </Link>
        <Link
          to="/add-book"
          onClick={closeMenu}
          className="hover:text-dorado transition-colors"
        >
          Añadir libro
        </Link>
        <Link
          to="/stats"
          onClick={closeMenu}
          className="hover:text-dorado transition-colors"
        >
          Estadísticas
        </Link>
        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-left cursor-pointer text-dorado hover:text-cream transition-colors border-t border-dorado/30 pt-5 md:border-t-0 md:pt-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Cerrar sesión
          </button>
        ) : (
          <Link
            to="/login"
            onClick={closeMenu}
            className="hover:text-dorado transition-colors border-t border-dorado/30 pt-5 md:border-t-0 md:pt-0"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
