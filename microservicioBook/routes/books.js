const express = require("express");
const router = express.Router();
const axios = require("axios");
const Book = require("../models/Book");

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

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Obtener una lista de libros
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de libros por página
 *     responses:
 *       200:
 *         description: Lista de libros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Book"
 */
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const books = await Book.find().skip(skip).limit(limit);
        res.status(200).json({ books });
    } catch (err) {
        console.error("❌ Error al obtener los libros:", err.message);
        res.status(500).json({ error: "No se pudo obtener la lista de libros" });
    }
});

/**
 * @swagger
 * /api/books/favorites:
 *   get:
 *     summary: Listar libros favoritos
 *     description: Obtener todos los libros marcados como favoritos.
 *     responses:
 *       200:
 *         description: Lista de libros favoritos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   isbn:
 *                     type: string
 *                   favorites:
 *                     type: boolean
 */
router.get('/favorites', async (req, res) => {
    console.log('📋 Listando libros favoritos...');

    try {
        const favorites = await Book.find({ favorites: true });
        console.log(`🔍 Resultado de la consulta:`, favorites);

        if (favorites.length === 0) {
            console.log(`⚠️ No se encontraron libros favoritos.`);
            return res.status(404).json({ message: 'No se encontraron libros favoritos.' });
        }

        console.log(`✅ Libros favoritos encontrados: ${favorites.length}`);
        res.json(favorites);
    } catch (err) {
        console.error('❌ Error listando libros favoritos:', err.message);
        res.status(500).json({ error: 'Error listando libros favoritos' });
    }
});

/**
 * @swagger
 * /api/books/{isbn}:
 *   get:
 *     summary: Obtener detalles de un libro
 *     description: Obtener información completa de un libro por su ISBN.
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *         description: ISBN del libro
 *     responses:
 *       200:
 *         description: Detalles del libro.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:isbn', async (req, res) => {
    const { isbn } = req.params;
    console.log(`🔍 Obteniendo detalles del libro con ISBN: ${isbn}`);

    try {
        const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const bookData = response.data[`ISBN:${isbn}`];

        if (bookData) {
            res.json({
                title: bookData.title || 'Título no disponible',
                authors: bookData.authors ? bookData.authors.map(author => author.name).join(', ') : 'Autor desconocido',
                publish_date: bookData.publish_date || 'Fecha de publicación no disponible',
                info_url: bookData.url || 'URL no disponible',
                thumbnail_url: bookData.cover ? bookData.cover.small : 'Thumbnail no disponible',
            });
        } else {
            res.status(404).json({ message: 'No se encontraron detalles para este ISBN.' });
        }
    } catch (err) {
        console.error('❌ Error obteniendo detalles del libro:', err.message);
        res.status(500).json({ error: 'Error obteniendo detalles del libro' });
    }
});

/**
 * @swagger
 * /api/books/search/{query}:
 *   get:
 *     summary: Buscar libros
 *     description: Buscar libros en OpenLibrary utilizando un término de búsqueda. Devuelve solo los datos esenciales (título, autor e ISBN).
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de libros encontrados con datos esenciales.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   isbn:
 *                     type: string
 */
router.get('/search/:query', async (req, res) => {
    const { query } = req.params;
    console.log(`🔍 Término buscado: ${query}`);

    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
        console.log('📥 Libros encontrados:', response.data.docs.length);

        const filteredBooks = response.data.docs.map((book) => ({
            title: book.title || 'Título no disponible',
            author: book.author_name ? book.author_name.join(', ') : 'Autor desconocido',
            isbn: book.isbn ? book.isbn[0] : 'ISBN no disponible',
        }));

        res.json(filteredBooks);
    } catch (err) {
        console.error('❌ Error buscando libros:', err.message);
        res.status(500).json({ error: 'Error buscando libros' });
    }
});

/**
 * @swagger
 * /api/books/favorites:
 *   post:
 *     summary: Añadir libro a favoritos
 *     description: Añadir un libro a la lista de favoritos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *     responses:
 *       200:
 *         description: Libro añadido a favoritos.
 */
router.post('/favorites', async (req, res) => {
    const { title, author, isbn } = req.body;
    console.log(`✨ Añadiendo libro a favoritos: ${title} (${isbn})`);

    try {
        const book = new Book({ title, author, isbn, favorites: true });
        await book.save();
        res.json({ message: 'Libro añadido a favoritos', book });
    } catch (err) {
        console.error('❌ Error añadiendo libro a favoritos:', err.message);
        res.status(500).json({ error: 'Error añadiendo libro a favoritos' });
    }
});

module.exports = router;
