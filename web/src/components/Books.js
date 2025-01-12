import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const Books = ({ favorites, setFavorites }) => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const navigate = useNavigate();

  const fetchBooks = async (page) => {
    try {
      setLoading(true);
      const response = await api.get(`/books`, { params: { page, limit: 10 } });
      setBooks((prevBooks) => [...prevBooks, ...response.data.books]);
    } catch (error) {
      console.error("Error al cargar los libros:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetails = async (isbn) => {
    try {
      const response = await api.get(`/books/${isbn}`);
      setBookDetails(response.data);
    } catch (error) {
      console.error("Error al obtener detalles del libro:", error);
    }
  };

  useEffect(() => {
    fetchBooks(page);
  }, [page]);

  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = window.innerHeight;

    if (scrollHeight - scrollTop <= clientHeight + 50 && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const openModal = (book) => {
    setSelectedBook(book);
    fetchBookDetails(book.isbn);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setBookDetails(null);
  };

  const addToFavorites = async (book) => {
    try {
      await api.post("/books/favorites", {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
      });
      setFavorites([...favorites, book]);
      closeModal();
    } catch (error) {
      console.error("Error al añadir libro a favoritos:", error);
    }
  };

  const searchBooks = async (query) => {
    try {
      const response = await api.get(`/books/search/${query}`);
      setBooks(response.data);
    } catch (error) {
      console.error("Error al buscar libros:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query) {
      searchBooks(query);
    } else {
      setBooks([]);
      setPage(1);
    }
  };

  return (
    <div className="container mx-auto p-4 relative">
      {/* Botón de Cerrar Sesión */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/auth");
        }}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Cerrar Sesión
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center">Libros</h1>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar libros por título..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Enlace a Favoritos */}
      <Link
        to="/favorites"
        className="text-blue-500 hover:underline mb-4 block text-center"
      >
        Ver Favoritos →
      </Link>

      {/* Lista de libros */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center cursor-pointer"
            onClick={() => openModal(book)}
          >
            <img
              src={book.image || "/placeholder.png"}
              alt={book.title}
              className="w-32 h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold text-center">{book.title}</h2>
            <p className="text-gray-700 text-sm text-center">
              Autor: {book.author}
            </p>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center text-gray-500">Cargando más libros...</p>
      )}

      {/* Modal para detalles del libro */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            {bookDetails ? (
              <>
                <img
                  src={bookDetails.thumbnail_url || "/placeholder.png"}
                  alt={bookDetails.title}
                  className="w-40 h-60 object-cover mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {bookDetails.title}
                </h2>
                <p className="text-gray-700 mb-2 text-center">
                  Autor: {bookDetails.authors}
                </p>
                <p className="text-gray-500 mb-4 text-center">
                  Publicado: {bookDetails.publish_date}
                </p>
                <p className="text-gray-600 mb-6 text-justify">
                  Más información:{" "}
                  <a
                    href={bookDetails.info_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {bookDetails.info_url}
                  </a>
                </p>
                <button
                  onClick={() => addToFavorites(selectedBook)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Añadir a Favoritos
                </button>
              </>
            ) : (
              <p className="text-center text-gray-500">Cargando detalles...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
