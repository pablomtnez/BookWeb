const axios = require("axios");
const fs = require("fs");

const BASE_URL = "https://openlibrary.org/search.json";
const DETAILS_URL = "https://openlibrary.org/works";

// Función para esperar
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Función para buscar libros en OpenLibrary
async function fetchBooks(page, limit) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: "fiction",
        page: page,
        limit: limit,
      },
    });
    return response.data.docs;
  } catch (error) {
    console.error(`Error al obtener libros (página ${page}): ${error.message}`);
    return [];
  }
}

// Función para obtener detalles de un libro, incluyendo la sinopsis
async function fetchBookDetails(workId) {
  try {
    const response = await axios.get(`${DETAILS_URL}/${workId}.json`);
    return response.data.description
      ? typeof response.data.description === "string"
        ? response.data.description
        : response.data.description.value
      : "Sin descripción disponible";
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn(`Rate limit hit for book ID: ${workId}. Retrying after delay...`);
      await sleep(2000); // Esperar 2 segundos antes de reintentar
      return fetchBookDetails(workId); // Reintentar la solicitud
    }
    console.error(`Error al obtener detalles del libro (ID: ${workId}): ${error.message}`);
    return "Sin descripción disponible";
  }
}

// Limpieza de datos
async function cleanData(book) {
  const workId = book.key.split("/").pop();
  const synopsis = await fetchBookDetails(workId);

  return {
    id: workId,
    isbn: book.isbn ? book.isbn[0] : "Unknown",
    title: book.title || "Unknown",
    author: book.author_name ? book.author_name[0] : "Unknown",
    publish_date: book.first_publish_year || "Unknown",
    pages: isNaN(Number(book.number_of_pages_median)) ? null : Number(book.number_of_pages_median),
    genre: book.subject ? book.subject[0] : "Unknown",
    language: book.language ? book.language[0] : "Unknown",
    synopsis: synopsis,
  };
}

// Generar archivo JSON con libros
async function generateBooksJson() {
  const booksDataset = [];
  const totalBooks = 10000; // Reducido para pruebas
  const batchSize = 100;

  console.log("Iniciando recopilación de libros...");

  for (let i = 1; booksDataset.length < totalBooks; i++) {
    console.log(`Obteniendo libros de la página ${i}`);
    const books = await fetchBooks(i, batchSize);

    if (books.length === 0) break;

    for (const book of books) {
      if (booksDataset.length < totalBooks) {
        await sleep(500); // Esperar 500ms antes de cada solicitud de sinopsis
        const cleanedBook = await cleanData(book);
        booksDataset.push(cleanedBook);
      }
    }

    await sleep(1000); // Esperar 1 segundo entre cada página
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
