const axios = require("axios");
const fs = require("fs");

const BASE_URL = "https://openlibrary.org/search.json";

// Función para buscar libros en OpenLibrary
async function fetchBooks(page, limit) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: "books",
        page: page,
        limit: limit,
      },
    });
    return response.data.docs;
  } catch (error) {
    console.error(`Error al obtener libros: ${error.message}`);
    return [];
  }
}

// Limpieza de datos
function cleanData(book) {
  return {
    id: book.key.split("/").pop(),
    isbn: book.isbn ? book.isbn[0] : "Unknown", // Agregar campo ISBN
    title: book.title || "Unknown",
    author: book.author_name ? book.author_name[0] : "Unknown",
    publish_date: book.first_publish_year || "Unknown",
    pages: isNaN(Number(book.number_of_pages_median)) ? null : Number(book.number_of_pages_median), // Convertir a número o null
    genre: book.subject ? book.subject[0] : "Unknown",
    language: book.language ? book.language[0] : "Unknown",
  };
}

// Generar archivo JSON con libros
async function generateBooksJson() {
  const booksDataset = [];
  const totalBooks = 10000;
  const batchSize = 100;

  console.log("Iniciando recopilación de libros...");

  for (let i = 1; booksDataset.length < totalBooks; i++) {
    console.log(`Obteniendo libros de la página ${i}`);
    const books = await fetchBooks(i, batchSize);

    if (books.length === 0) break;

    books.forEach((book) => {
      if (booksDataset.length < totalBooks) {
        booksDataset.push(cleanData(book));
      }
    });
  }

  const finalData = { "Books dataset": booksDataset };

  // Crear carpeta "data" si no existe
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }

  // Guardar en archivo JSON
  fs.writeFileSync("./data/book.json", JSON.stringify(finalData, null, 2));
  console.log("Archivo book.json creado con éxito.");
}

generateBooksJson();
