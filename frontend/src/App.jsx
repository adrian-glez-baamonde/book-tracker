import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import StatsPage from "./pages/StatsPage";
import AddBookPage from "./pages/AddBookPage";

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-linear-to-b from-cream via-cream to-cream-dark text-tinta">
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
