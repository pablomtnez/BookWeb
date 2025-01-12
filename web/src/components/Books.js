import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1); // Página actual
  const [loading, setLoading] = useState(false); // Indicador de carga

  const fetchBooks = async (page) => {
    const fakeBooks = Array.from({ length: 10 }, (_, index) => ({
      title: `Libro ${index + 1 + (page - 1) * 10}`,
      author: "Autor Desconocido",
      genre: "Ficción",
      image: "https://via.placeholder.com/150",
    }));
    return fakeBooks;
  };

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      const newBooks = await fetchBooks(page);
      setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      setLoading(false);
    };

    loadBooks();
  }, [page]);

  // Manejar el scroll infinito
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
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup
  }, [handleScroll]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Libros</h1>
      <Link
        to="/favorites"
        className="text-blue-500 hover:underline mb-4 block text-center"
      >
        Ver Favoritos →
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center"
          >
            <img
              src={book.image}
              alt={book.title}
              className="w-32 h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold text-center">{book.title}</h2>
            <p className="text-gray-700 text-sm text-center">Autor: {book.author}</p>
            <p className="text-gray-500 text-sm text-center">Género: {book.genre}</p>
          </div>
        ))}
      </div>
      {loading && <p className="text-center text-gray-500">Cargando más libros...</p>}
    </div>
  );
};

export default Books;
