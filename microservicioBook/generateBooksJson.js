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
    console.error(`Error al obtener libros en la página ${page}: ${error.message}`);
    return [];
  }
}

// Limpieza de datos
function cleanData(book) {
  return {
    id: book.key.split("/").pop(),
    title: book.title || "Unknown",
    author: book.author_name ? book.author_name[0] : "Unknown",
    publish_date: book.first_publish_year || "Unknown",
    pages: isNaN(Number(book.number_of_pages_median)) ? null : Number(book.number_of_pages_median),
    genre: book.subject ? book.subject[0] : "Unknown",
    language: book.language ? book.language[0] : "Unknown",
  };
}

// Generar archivo JSON con libros
async function generateBooksJson() {
  const booksDataset = [];
  const totalBooks = 10000; // Cantidad total de libros que queremos
  const batchSize = 100; // Tamaño del lote
  const maxParallelRequests = 10; // Número máximo de solicitudes paralelas

  console.log("Iniciando recopilación de libros...");

  // Crea un array de promesas para procesar solicitudes en paralelo
  const promises = [];
  for (let i = 1; i <= Math.ceil(totalBooks / batchSize); i++) {
    promises.push(fetchBooks(i, batchSize));

    // Ejecuta en paralelo hasta `maxParallelRequests`
    if (promises.length === maxParallelRequests || i === Math.ceil(totalBooks / batchSize)) {
      const results = await Promise.all(promises);
      results.flat().forEach((book) => {
        if (booksDataset.length < totalBooks) {
          booksDataset.push(cleanData(book));
        }
      });
      promises.length = 0; // Limpia las promesas
    }
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
