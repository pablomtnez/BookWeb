const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Cargar configuración desde .env
dotenv.config();

// Conectar a la base de datos
const connectDB = require("./config/db");
connectDB();

// Definir esquema y modelo de Mongoose
const BookSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: String,
  publish_date: String,
  pages: {
    type: Number,
    required: false, // Permite que el campo sea opcional
  },
  genre: String,
  language: String,
});

const Book = mongoose.model("Book", BookSchema);

// Inicializar Express
const app = express();
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Books API",
      version: "1.0.0",
      description: "API para gestionar libros usando MongoDB y Express",
    },
    servers: [
      {
        url: "http://localhost:9000",
        description: "Servidor local",
      },
    ],
    components: {
      schemas: {
        Book: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            author: { type: "string" },
            publish_date: { type: "string" },
            pages: { type: "number" },
            genre: { type: "string" },
            language: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./main.js"], // Ubicación de las anotaciones Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /books/uploadData:
 *   get:
 *     summary: Carga los datos desde el archivo book.json a la base de datos
 *     responses:
 *       200:
 *         description: Datos cargados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Datos cargados correctamente
 *       500:
 *         description: Error al cargar los datos
 */
app.get('/books/uploadData', async (req, res) => {
  console.log("[LOG] GET /books/uploadData - Iniciando carga de datos");
  try {
    const data = JSON.parse(fs.readFileSync('./data/book.json', 'utf8'));
    if (!data["Books dataset"] || !Array.isArray(data["Books dataset"])) {
      console.error("[ERROR] Formato inválido en book.json");
      return res.status(400).json({ error: "Formato inválido en book.json" });
    }

    await Book.deleteMany({});
    console.log("[LOG] Datos antiguos eliminados");

    await Book.insertMany(data["Books dataset"]);
    console.log("[LOG] Datos nuevos insertados exitosamente");
    res.status(200).send({ message: "Datos cargados correctamente" });
  } catch (error) {
    console.error("[ERROR] Error al cargar datos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /books/getAll:
 *   get:
 *     summary: Obtiene todos los libros de la base de datos
 *     responses:
 *       200:
 *         description: Libros obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Error al obtener los libros
 */
app.get("/books/getAll", async (req, res) => {
  console.log("[LOG] GET /books/getAll - Recuperando todos los libros");
  try {
    const books = await Book.find();
    console.log(`[LOG] ${books.length} libros encontrados`);
    res.status(200).json(books);
  } catch (error) {
    console.error("[ERROR] Error al obtener libros:", error.message);
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /books/id/{bookID}:
 *   get:
 *     summary: Busca un libro por su ID
 *     parameters:
 *       - in: path
 *         name: bookID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del libro a buscar
 *     responses:
 *       200:
 *         description: Libro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Libro no encontrado
 *       500:
 *         description: Error al buscar el libro
 */
app.get("/books/id/:bookID", async (req, res) => {
  console.log(`[LOG] GET /books/id/${req.params.bookID} - Buscando libro`);
  try {
    const book = await Book.findOne({ id: req.params.bookID });
    if (!book) {
      console.warn(`[WARN] Libro con ID ${req.params.bookID} no encontrado`);
      return res.status(404).send({ error: "Libro no encontrado" });
    }
    console.log("[LOG] Libro encontrado:", book.title);
    res.status(200).json(book);
  } catch (error) {
    console.error("[ERROR] Error al buscar libro:", error.message);
    res.status(500).send({ error: error.message });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`[LOG] Servidor corriendo en http://localhost:${PORT}`);
});
