const express = require('express');
const app = express();
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');
const booksRoutes = require('./routes/books');

// Conectar a MongoDB
connectDB();

// Middleware
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
