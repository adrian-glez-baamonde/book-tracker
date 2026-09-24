import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import Logo from "../components/Logo";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Reveal className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="card-surface relative overflow-hidden px-8 py-10 shadow-lg"
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-granate via-dorado to-verde" />

          <div className="flex flex-col items-center mb-8">
            <Logo className="h-14 w-14 text-dorado mb-3" />
            <h1 className="text-4xl text-verde">Monfort</h1>
            <p className="font-serif italic text-tinta/60 mt-1">
              Tu biblioteca personal
            </p>
          </div>

          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field mb-6"
          />

          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>

          {error && (
            <p className="mt-4 text-sm text-center text-granate bg-granate/5 border border-granate/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>
      </Reveal>
    </div>
  );
}

export default LoginPage;
