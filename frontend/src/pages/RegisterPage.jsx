import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { login, register } from "../services/auth";
import { useSlowHint } from "../hooks/useSlowHint";

const MIN_PASSWORD_LENGTH = 8;

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSlow = useSlowHint(isSubmitting);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      await login(email, password); // Entra directamente tras registrarse
      navigate("/");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      subtitle="Crea tu biblioteca"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-granate hover:underline"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="input-field mb-4"
        />

        <label htmlFor="password" className="field-label">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          className="input-field mb-4"
        />

        <label htmlFor="confirmPassword" className="field-label">
          Repite la contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="input-field mb-6"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {isSlow && (
        <p className="mt-4 text-center text-sm italic text-tinta/60 animate-pulse">
          Despertando el servidor... la primera vez puede tardar hasta un
          minuto.
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-center text-granate bg-granate/5 border border-granate/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </AuthCard>
  );
}

export default RegisterPage;
