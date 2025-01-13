import axios from "axios";

// Configuración base
const baseConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

// Configuración para el microservicio de autenticación
const authApi = axios.create({
  baseURL: process.env.REACT_APP_AUTH_BASE_URL || "http://localhost:8000", // BaseURL dinámico
  ...baseConfig,
});

// Configuración para el microservicio de libros
const booksApi = axios.create({
  baseURL: process.env.REACT_APP_BOOKS_BASE_URL || "http://localhost:9000", // BaseURL dinámico
  ...baseConfig,
});

// Interceptor para incluir el token automáticamente
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[LOG] Token agregado al encabezado:", token); // Log para depurar el token
  } else {
    console.warn("[WARN] No se encontró un token en localStorage"); // Log si el token no existe
  }
  return config;
};

// Manejo general de errores
const handleError = (error) => {
  if (error.response?.status === 401) {
    console.error("[ERROR] Token inválido o expirado. Redirigiendo a /auth");
    localStorage.removeItem("token");
    window.location.href = "/auth";
  } else if (error.response?.status === 404) {
    console.warn("[WARN] Endpoint no encontrado:", error.response.config.url);
  } else if (error.response?.status === 500) {
    console.error("[ERROR] Error interno del servidor:", error.response);
  } else {
    console.error("[ERROR] Respuesta del backend:", error.response);
  }
  return Promise.reject(error);
};

// Aplicar interceptores a authApi
authApi.interceptors.request.use(attachToken, (error) => {
  console.error("[ERROR] Fallo en la solicitud del interceptor (authApi):", error);
  return Promise.reject(error);
});

// Aplicar interceptores a booksApi
booksApi.interceptors.request.use(attachToken, (error) => {
  console.error("[ERROR] Fallo en la solicitud del interceptor (booksApi):", error);
  return Promise.reject(error);
});

booksApi.interceptors.response.use(
  (response) => {
    if (response.config.url.includes("/proxy/images/")) {
      console.log("[LOG] Imagen recibida desde el proxy:", response.config.url);
    } else if (response.config.url.includes("/favorites")) {
      console.log("[LOG] Respuesta de favoritos:", response.data);
    }
    return response;
  },
  handleError
);

// Exportación única
export { authApi, booksApi };
