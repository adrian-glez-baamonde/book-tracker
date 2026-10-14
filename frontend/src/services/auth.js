import { API_URL } from "../config";

// Intenta sacar el mensaje "detail" que devuelve FastAPI; si no, usa uno genérico
async function getErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // La respuesta no era JSON: usamos el mensaje genérico
  }
  return fallback;
}

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Email o contraseña incorrectos");
  }

  const data = await response.json();
  localStorage.setItem("token", data.access_token);
}

export async function register(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 409) {
    throw new Error("Ya existe una cuenta con ese email");
  }
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Revisa el email y la contraseña"),
    );
  }
}
