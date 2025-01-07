const express = require('express');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');
const booksRoutes = require('./routes/books');

const app = express();

// Mensaje básico para confirmar que el servidor está inicializado
console.log('🚀 Servidor inicializado correctamente y listo para recibir solicitudes');

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
app.use('/api/books', booksRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Puerto del servidor
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});
