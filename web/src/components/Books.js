import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { booksApi } from "../api";

const Books = ({ favorites, setFavorites }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  // Función para cargar datos en el backend automáticamente
  const uploadData = useCallback(async () => {
    try {
      setLoading(true);
      await booksApi.get("/books/uploadData");
      console.log("Datos cargados correctamente");
    } catch (error) {
      console.error("Error al cargar datos automáticamente:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar libros desde el backend
  const fetchBooks = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const response = await booksApi.get(`/books/getAll`, {
        params: { page, limit: 20 },
      });
      setBooks((prevBooks) => [...prevBooks, ...response.data]);
      setHasMore(response.data.length > 0);
    } catch (error) {
      console.error("Error al cargar los libros:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  // Inicializa los datos y carga los libros al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      await uploadData(); // Cargar datos automáticamente
      await fetchBooks(); // Obtener libros después de cargar datos
    };
    initializeData();
  }, [uploadData, fetchBooks]);

  // Maneja el scroll infinito
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="container mx-auto p-4">
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

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar libros por título..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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
      {!hasMore && (
        <p className="text-center text-gray-500">No hay más libros para mostrar.</p>
      )}
    </div>
  );
};

export default Books;
