import axios from "axios";

// Configuración base para el microservicio de autenticación
export const authApi = axios.create({
  baseURL: "http://localhost:8000", // Microservicio de autenticación (FastAPI)
  headers: {
    "Content-Type": "application/json",
  },
});

// Configuración base para el microservicio de libros
export const booksApi = axios.create({
  baseURL: "http://localhost:9000/api/books", // Microservicio de libros (Express.js)
  headers: {
    "Content-Type": "application/json",
  },
});
