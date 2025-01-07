const express = require('express');
const router = express.Router();
const axios = require('axios');
const Book = require('../models/Book');

// Buscar libros en OpenLibrary
router.get('/search/:query', async (req, res) => {
    const { query } = req.params;
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Error buscando libros en OpenLibrary' });
    }
});

// Obtener detalles de un libro
router.get('/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`);
        res.json(response.data[`ISBN:${isbn}`]);
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo detalles del libro' });
    }
});

// Añadir libro a favoritos
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

// Listar favoritos
router.get('/favorites', async (req, res) => {
    try {
        const favorites = await Book.find({ favorites: true });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: 'Error listando favoritos' });
    }
});

module.exports = router;
