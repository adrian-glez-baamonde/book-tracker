import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { login } from "../services/auth";
import { useSlowHint } from "../hooks/useSlowHint";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../constants/demo";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSlow = useSlowHint(isSubmitting);
  const navigate = useNavigate();

  async function doLogin(loginEmail, loginPassword) {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doLogin(email, password);
  }

  return (
    <AuthCard
      subtitle="Tu biblioteca personal"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-medium text-granate hover:underline"
          >
            Regístrate
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-field mb-6"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-tinta/40">
        <span className="h-px flex-1 bg-dorado/30" />o
        <span className="h-px flex-1 bg-dorado/30" />
      </div>

      <button
        type="button"
        onClick={() => doLogin(DEMO_EMAIL, DEMO_PASSWORD)}
        disabled={isSubmitting}
        className="w-full cursor-pointer rounded-md border border-dorado/60 px-4 py-2 text-sm text-verde transition hover:border-granate hover:text-granate disabled:cursor-not-allowed disabled:opacity-60"
      >
        Probar con la cuenta demo
      </button>

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

export default LoginPage;
