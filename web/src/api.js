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
  baseURL: "http://localhost:9000", // Cambiado al endpoint raíz del backend
  ...baseConfig,
});

// Interceptor para incluir el token automáticamente
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Interceptor para manejar errores globalmente
const handleError = (error) => {
  if (error.response?.status === 401) {
    // Si el token es inválido o ha expirado, redirige al usuario a /auth
    localStorage.removeItem("token");
    window.location.href = "/auth";
  }
  return Promise.reject(error);
};

// Aplicar interceptores
booksApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
booksApi.interceptors.response.use((response) => response, handleError);

authApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
authApi.interceptors.response.use((response) => response, handleError);
