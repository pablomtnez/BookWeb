const axios = require("axios");
const fs = require("fs");

const BASE_URL = "https://openlibrary.org/search.json";

// Función para buscar libros en OpenLibrary
async function fetchBooks(page, limit) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: "books", // Consulta general
        page: page, // Página actual
        limit: limit, // Resultados por página
      },
    });
    return response.data.docs;
  } catch (error) {
    console.error(`Error al obtener libros: ${error.message}`);
    return [];
  }
}

// Generar archivo JSON con libros
async function generateBooksJson() {
  const booksDataset = [];
  const totalBooks = 10000; // Cantidad total de libros que queremos
  const batchSize = 100; // Tamaño del lote (máximo por solicitud)

  console.log("Iniciando recopilación de libros...");

  for (let i = 1; booksDataset.length < totalBooks; i++) {
    console.log(`Obteniendo libros de la página ${i}`);
    const books = await fetchBooks(i, batchSize);

    if (books.length === 0) break;

    books.forEach((book) => {
      if (booksDataset.length < totalBooks) {
        booksDataset.push({
          id: booksDataset.length + 1,
          title: book.title || "Unknown",
          author: book.author_name ? book.author_name[0] : "Unknown",
          publish_date: book.first_publish_year || "Unknown",
          pages: book.number_of_pages_median || "Unknown",
          genre: book.subject ? book.subject[0] : "Unknown",
          language: book.language ? book.language[0] : "Unknown",
        });
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
