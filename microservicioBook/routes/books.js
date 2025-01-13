const express = require("express");
const router = express.Router();
const axios = require("axios"); // Asegúrate de importar axios
const Book = require("../models/Book");
const { loadBooks } = require("../scripts/loadBooks"); // Importar la función para cargar libros

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Título del libro
 *         author:
 *           type: string
 *           description: Autor del libro
 *         isbn:
 *           type: string
 *           description: ISBN único del libro
 *         favorites:
 *           type: boolean
 *           description: Indica si el libro está marcado como favorito
 *       required:
 *         - title
 *         - author
 *         - isbn
 */

// Obtener una lista de libros con paginación
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Verificar si hay suficientes libros en la base de datos
    const totalBooks = await Book.countDocuments();
    if (totalBooks < skip + limit) {
      console.log("🔄 Cargando más libros desde OpenLibrary...");
      await loadBooks("programming"); // Carga más libros automáticamente si es necesario
    }

    const books = await Book.find().skip(skip).limit(limit);
    res.status(200).json({ books });
  } catch (err) {
    console.error("❌ Error al obtener los libros:", err.message);
    res.status(500).json({ error: "No se pudo obtener la lista de libros" });
  }
});

// Listar libros favoritos
router.get("/favorites", async (req, res) => {
  console.log("📋 Listando libros favoritos...");

  try {
    const favorites = await Book.find({ favorites: true });
    if (favorites.length === 0) {
      return res.status(404).json({ message: "No se encontraron libros favoritos." });
    }

    console.log(`✅ Libros favoritos encontrados: ${favorites.length}`);
    res.status(200).json(favorites);
  } catch (err) {
    console.error("❌ Error listando libros favoritos:", err.message);
    res.status(500).json({ error: "Error listando libros favoritos" });
  }
});

// Obtener detalles de un libro desde OpenLibrary
router.get("/:isbn", async (req, res) => {
  const { isbn } = req.params;

  if (!isbn) {
    return res.status(400).json({ error: "El parámetro ISBN es obligatorio." });
  }

  console.log(`🔍 Obteniendo detalles del libro con ISBN: ${isbn}`);

  try {
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const bookData = response.data[`ISBN:${isbn}`];

    if (!bookData) {
      return res.status(404).json({ message: "No se encontraron detalles para este ISBN." });
    }

    res.status(200).json({
      title: bookData.title || "Título no disponible",
      authors: bookData.authors ? bookData.authors.map((a) => a.name).join(", ") : "Autor desconocido",
      publish_date: bookData.publish_date || "Fecha de publicación no disponible",
      info_url: bookData.url || "URL no disponible",
      thumbnail_url: bookData.cover ? bookData.cover.small : "Thumbnail no disponible",
    });
  } catch (err) {
    console.error("❌ Error obteniendo detalles del libro:", err.message);
    res.status(500).json({ error: "Error obteniendo detalles del libro" });
  }
});

// Buscar libros en OpenLibrary
router.get("/search/:query", async (req, res) => {
  const { query } = req.params;

  if (!query) {
    return res.status(400).json({ error: "El término de búsqueda es obligatorio." });
  }

  console.log(`🔍 Término buscado: ${query}`);

  try {
    const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
    const filteredBooks = response.data.docs.map((book) => ({
      title: book.title || "Título no disponible",
      author: book.author_name ? book.author_name.join(", ") : "Autor desconocido",
      isbn: book.isbn ? book.isbn[0] : "ISBN no disponible",
    }));

    res.status(200).json(filteredBooks);
  } catch (err) {
    console.error("❌ Error buscando libros:", err.message);
    res.status(500).json({ error: "Error buscando libros" });
  }
});

// Añadir un libro a favoritos
router.post("/favorites", async (req, res) => {
  const { title, author, isbn } = req.body;

  if (!title || !author || !isbn) {
    return res.status(400).json({ error: "Todos los campos son obligatorios (título, autor, ISBN)." });
  }

  console.log(`✨ Añadiendo libro a favoritos: ${title} (${isbn})`);

  try {
    const book = new Book({ title, author, isbn, favorites: true });
    await book.save();
    res.status(200).json({ message: "Libro añadido a favoritos", book });
  } catch (err) {
    console.error("❌ Error añadiendo libro a favoritos:", err.message);
    res.status(500).json({ error: "Error añadiendo libro a favoritos" });
  }
});

module.exports = router;
