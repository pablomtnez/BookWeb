const express = require("express");
const app = express();
const fs = require("fs");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const port = process.env.PORT || 9000;

// Conectar a MongoDB
connectDB();

// Definir esquema de Mongoose
const BookSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: String,
  year: Number,
  genre: String,
  pages: Number,
});

// Crear modelo de Mongoose
const Book = mongoose.model("Book", BookSchema);

/**
 * @swagger
 * /books/uploadData:
 *   get:
 *     description: Uploads the data from the file book.json into the database
 *     responses:
 *       200:
 *         description: Data uploaded successfully
 *       500:
 *         description: Error uploading the data
 */
app.get("/books/uploadData", async (req, res) => {
  try {
    // Leer datos del archivo
    const data = fs.readFileSync("./data/book.json", "utf8");
    const jsonData = JSON.parse(data);

    if (!Array.isArray(jsonData)) {
      throw new TypeError("The data is not an array");
    }

    // Eliminar todos los datos de la base de datos
    await Book.deleteMany({});

    // Insertar nuevos datos en la base de datos
    await Book.insertMany(jsonData);

    console.log("Data uploaded successfully");
    res.send("Data uploaded successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /books/getAll:
 *   get:
 *     description: Get all the books from the database
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *       500:
 *         description: Error retrieving the data
 */
app.get("/books/getAll", async (req, res) => {
  try {
    const books = await Book.find();
    console.log(books.length + " elements retrieved successfully");
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /books/id/{bookID}:
 *   get:
 *     description: Get the data from the database by ID
 *     parameters:
 *       - in: path
 *         name: bookID
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the book
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Error retrieving the data
 */
app.get("/books/id/:bookID", async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.bookID });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar Swagger para la documentación
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Books API",
      version: "1.0.0",
      description: "Books API documentation",
    },
    components: {
      schemas: {
        Book: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            author: { type: "string" },
            year: { type: "number" },
            genre: { type: "string" },
            pages: { type: "number" },
          },
        },
      },
    },
  },
  apis: [__filename],
};

const swaggerSpec = require("swagger-jsdoc")(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
