import axios from "axios";

// Configuración base
const baseConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

// Configuración para el microservicio de autenticación
export const authApi = axios.create({
  baseURL: "http://localhost:8000", // Microservicio de autenticación
  ...baseConfig,
});

// Configuración para el microservicio de libros
export const booksApi = axios.create({
  baseURL: "http://localhost:9000", // Microservicio de libros
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

// Interceptor para manejar errores globalmente
const handleError = (error) => {
  if (error.response?.status === 401) {
    console.error("[ERROR] Token inválido o expirado. Redirigiendo a /auth"); // Log para errores 401
    localStorage.removeItem("token");
    window.location.href = "/auth"; // Redirección al endpoint de autenticación
  } else if (error.response?.status === 404) {
    console.warn("[WARN] Endpoint no encontrado:", error.response.config.url); // Log para errores 404
  } else if (error.response?.status === 500) {
    console.error("[ERROR] Error interno del servidor:", error.response); // Log para errores 500
  } else {
    console.error("[ERROR] Respuesta del backend:", error.response); // Log para otros errores
  }
  return Promise.reject(error);
};

// Interceptor para manejar las imágenes del proxy
const handleImageProxyError = (error) => {
  if (error.response?.status === 404) {
    console.warn("[WARN] Imagen no encontrada. Usando placeholder por defecto.");
  } else {
    console.error("[ERROR] Error en la solicitud de imagen del proxy:", error);
  }
  return Promise.reject(error);
};

// Aplicar interceptores a booksApi
booksApi.interceptors.request.use(attachToken, (error) => {
  console.error("[ERROR] Fallo en la solicitud del interceptor (booksApi):", error);
  return Promise.reject(error);
});
booksApi.interceptors.response.use(
  (response) => {
    console.log("[LOG] Respuesta recibida (booksApi):", response.data); // Log para respuestas exitosas
    return response;
  },
  handleError
);

// Aplicar interceptores para el manejo de imágenes
booksApi.interceptors.response.use(
  (response) => {
    if (response.config.url.includes("/proxy/images/")) {
      console.log("[LOG] Imagen recibida desde el proxy:", response.config.url); // Log de imágenes
    }
    return response;
  },
  handleImageProxyError
);

// Aplicar interceptores a authApi
authApi.interceptors.request.use(attachToken, (error) => {
  console.error("[ERROR] Fallo en la solicitud del interceptor (authApi):", error);
  return Promise.reject(error);
});
authApi.interceptors.response.use(
  (response) => {
    console.log("[LOG] Respuesta recibida (authApi):", response.data); // Log para respuestas exitosas de autenticación
    return response;
  },
  handleError
);
