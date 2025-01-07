const express = require('express');
const router = express.Router();
const axios = require('axios');
const Book = require('../models/Book');

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
        console.log('📤 Realizando solicitud a OpenLibrary...');
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`, {
            timeout: 10000, // Tiempo de espera de 10 segundos
        });
        console.log('📥 Respuesta recibida de OpenLibrary:', response.data.docs.length, 'libros encontrados.');

        const filteredBooks = response.data.docs.map((book) => ({
            title: book.title || 'Título no disponible',
            author: book.author_name ? book.author_name.join(', ') : 'Autor desconocido',
            isbn: book.isbn ? book.isbn[0] : 'ISBN no disponible',
        }));

        console.log(`✅ Libros procesados y enviados: ${filteredBooks.length}`);
        res.json(filteredBooks);
    } catch (err) {
        console.error('❌ Error buscando libros en OpenLibrary:', err.message);
        res.status(500).json({ error: 'Error buscando libros en OpenLibrary' });
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
    console.log(`📋 Listando libros favoritos`);

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
        console.error('❌ Error listando favoritos:', err.message);
        res.status(500).json({ error: 'Error listando favoritos' });
    }
});

module.exports = router;
