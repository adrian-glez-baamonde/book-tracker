import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import StatsPage from "./pages/StatsPage";
import AddBookPage from "./pages/AddBookPage";
import BookDetailPage from "./pages/BookDetailPage";

// Pantallas de acceso: se muestran sin Navbar
const AUTH_PATHS = ["/login", "/register"];

function App() {
  const location = useLocation();
  const showNavbar = !AUTH_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-cream via-cream to-cream-dark text-tinta">
      {showNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id"
          element={
            <ProtectedRoute>
              <BookDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-book"
          element={
            <ProtectedRoute>
              <AddBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
