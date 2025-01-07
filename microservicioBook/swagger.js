const swaggerJsdoc = require('swagger-jsdoc');

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de Libros',
            version: '1.0.0',
            description: 'API para gestionar libros utilizando OpenLibrary',
        },
        servers: [
            {
                url: 'http://localhost:9000',
            },
        ],
    },
    apis: ['./routes/books.js'], // Archivo donde se definen las rutas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;
