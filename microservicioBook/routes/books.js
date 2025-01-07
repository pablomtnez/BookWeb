const express = require('express');
const router = express.Router();
const axios = require('axios');
const Book = require('../models/Book');

/**
 * @swagger
 * /api/books/search/{query}:
 *   get:
 *     summary: Buscar libros
 *     description: Buscar libros en OpenLibrary utilizando un término de búsqueda.
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de libros encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/search/:query', async (req, res) => {
    const { query } = req.params;
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Error buscando libros en OpenLibrary' });
    }
});

/**
 * @swagger
 * /api/books/{isbn}:
 *   get:
 *     summary: Obtener detalles de un libro
 *     description: Obtener información de un libro por su ISBN.
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
    try {
        const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`);
        res.json(response.data[`ISBN:${isbn}`]);
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo detalles del libro' });
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
    try {
        const book = new Book({ title, author, isbn, favorites: true });
        await book.save();
        res.json({ message: 'Libro añadido a favoritos', book });
    } catch (err) {
        res.status(500).json({ error: 'Error añadiendo libro a favoritos' });
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
    try {
        const favorites = await Book.find({ favorites: true });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: 'Error listando favoritos' });
    }
});

module.exports = router;
