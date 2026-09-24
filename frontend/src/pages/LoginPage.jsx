import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/60 border border-dorado rounded-lg shadow-md p-6"
      >
        <h1 className="text-2xl font-bold text-verde mb-6 text-center">
          Iniciar sesión
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-dorado rounded px-3 py-2 mb-3 bg-cream focus:outline-none focus:ring-2 focus:ring-granate"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full border border-dorado rounded px-3 py-2 mb-4 bg-cream focus:outline-none focus:ring-2 focus:ring-granate"
        />

        <button
          type="submit"
          className="w-full bg-granate text-cream font-semibold py-2 rounded hover:bg-granate/90 transition"
        >
          Entrar
        </button>

        {error && <p className="text-red-700 text-sm mt-3">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
