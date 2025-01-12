const mongoose = require("mongoose");
const axios = require("axios");
const Book = require("../models/Book");

// Función para conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/microservicioBook", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conectado a MongoDB");
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err.message);
        process.exit(1);
    }
};

// Función para obtener libros desde OpenLibrary
const fetchBooks = async (query) => {
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
        return response.data.docs.map((book) => ({
            title: book.title || "Título no disponible",
            author: book.author_name ? book.author_name.join(", ") : "Autor desconocido",
            isbn: book.isbn ? book.isbn[0] : "ISBN no disponible",
        }));
    } catch (err) {
        console.error("Error al obtener libros de OpenLibrary:", err.message);
        return [];
    }
};

// Función para guardar libros en MongoDB
const saveBooks = async (books) => {
    let savedCount = 0;
    try {
        for (const book of books) {
            const existingBook = await Book.findOne({ isbn: book.isbn });
            if (!existingBook) {
                await Book.create(book);
                savedCount++;
            }
        }
        console.log(`${savedCount} libros guardados en MongoDB`);
    } catch (err) {
        console.error("Error al guardar libros en MongoDB:", err.message);
    }
    return savedCount;
};

// Función principal para cargar libros
const loadBooks = async (query = "programming") => {
    console.log("🔄 Cargando libros desde OpenLibrary...");
    const books = await fetchBooks(query);
    const savedCount = await saveBooks(books);
    console.log(`✅ Proceso completado. Libros nuevos guardados: ${savedCount}`);
    return savedCount;
};

// Exportar la función para usarla en el endpoint
module.exports = { loadBooks };

// Si el script se ejecuta directamente, cargar libros
if (require.main === module) {
    (async () => {
        await connectDB();
        await loadBooks();
        mongoose.connection.close();
    })();
}
