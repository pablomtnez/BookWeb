const express = require("express");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");
const booksRoutes = require("./routes/books");
const cors = require("cors"); // Middleware para CORS
require("dotenv").config(); // Cargar variables de entorno desde .env

const app = express();

// Configurar CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Permitir solicitudes desde el frontend
    credentials: true, // Permitir cookies y encabezados de autenticación
  })
);

// Mensaje básico para confirmar que el servidor está inicializado
console.log("🚀 Servidor inicializado correctamente y listo para recibir solicitudes");

// Conectar a MongoDB
connectDB();

// Middleware global para registrar solicitudes
app.use((req, res, next) => {
  console.log(`📥 Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Middleware para manejar datos JSON
app.use(express.json());

// Rutas
app.use("/api/books", booksRoutes);

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para manejar errores globalmente
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // No exponer la pila en producción
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});
