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

      <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
        } fixed md:static top-0 right-0 h-screen md:h-auto w-64 md:w-auto bg-verde md:bg-transparent flex flex-col md:flex-row md:items-center gap-4 px-6 md:px-0 py-16 md:py-0 transition-transform duration-300 md:transition-none z-50`}
      >
        <button className="md:hidden self-end text-xl" onClick={closeMenu}>
          ✕
        </button>

        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/add-book" onClick={closeMenu}>
          Add Book
        </Link>
        <Link to="/stats" onClick={closeMenu}>
          Stats
        </Link>
        {token ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" onClick={closeMenu}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
