import React, { useState, useEffect, useCallback, useContext } from "react";
import Modal from "react-modal";
import { booksApi } from "../api";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../FavoritesContext"; // Importar el contexto de favoritos

Modal.setAppElement("#root");

const Books = () => {
  const { favorites, addToFavorites } = useContext(FavoritesContext); // Acceso al contexto
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Función para cargar libros desde el backend
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await booksApi.get(`/books/getAll`, {
        params: { page, limit: 20 },
      });
      setBooks(response.data.books);
      setFilteredBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("[ERROR] Error al cargar los libros:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Inicializar y cargar libros al cambiar de página
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, page]);

  // Filtrar libros según el texto de búsqueda
  useEffect(() => {
    const filtered = books.filter((book) =>
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  // Función para cambiar de página
  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Función para abrir el modal y mostrar el libro seleccionado
  const openModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Libros</h1>

      {/* Campo de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar libros por título, autor o ISBN..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center"
            onClick={() => openModal(book)}
          >
            <img
              src={
                book.isbn
                  ? `http://localhost:9000/proxy/images/${book.isbn}`
                  : "/placeholder.png"
              }
              alt={book.title || "Título no disponible"}
              className="w-32 h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold text-center">
              {book.title || "Sin título"}
            </h2>
            <p className="text-gray-700 text-sm text-center">
              Autor: {book.author || "Autor desconocido"}
            </p>
            <p className="text-gray-700 text-sm text-center">
              ISBN: {book.isbn || "No disponible"}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToFavorites(book); // Usar el contexto para añadir a favoritos
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Añadir a Favoritos
            </button>
          </div>
        ))}
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => changePage(page - 1)}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Anterior
        </button>
        <span className="text-lg font-semibold">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => changePage(page + 1)}
          disabled={page === totalPages || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Siguiente
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Cargando libros...</p>
      )}

      {/* Botón para ir a la página de Favoritos */}
      <div className="flex justify-center mt-6">
        <Link to="/favorites">
          <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Ver Favoritos
          </button>
        </Link>
      </div>

      {/* Modal para mostrar información del libro */}
      {selectedBook && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Información del Libro"
          className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto my-20 max-h-screen overflow-y-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            ✖
          </button>
          <h2 className="text-2xl font-bold mb-4">{selectedBook.title}</h2>
          <p>
            <strong>Autor:</strong> {selectedBook.author || "Desconocido"}
          </p>
          <p>
            <strong>Fecha de publicación:</strong> {selectedBook.publish_date || "Desconocida"}
          </p>
          <p>
            <strong>Páginas:</strong> {selectedBook.pages || "No especificado"}
          </p>
          <p>
            <strong>Género:</strong> {selectedBook.genre || "No especificado"}
          </p>
          <p>
            <strong>Idioma:</strong> {selectedBook.language || "No especificado"}
          </p>
          <p>
            <strong>ISBN:</strong> {selectedBook.isbn || "No disponible"}
          </p>
          <p>
            <strong>Sinopsis:</strong> {selectedBook.synopsis || "No disponible"}
          </p>
          <button
            onClick={() => addToFavorites(selectedBook)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Añadir a Favoritos
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Books;
