import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { booksApi } from "../api";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Para redirigir si el token no es válido

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Debes iniciar sesión para ver tus favoritos.");
          navigate("/auth");
          return;
        }

        const response = await booksApi.get("/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(response.data.favorites || []);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
        setMessage("No se pudieron cargar los favoritos. Por favor, inténtalo de nuevo.");
      }
    };

    fetchFavorites();
  }, [navigate]);

  const removeFavorite = async (book) => {
    try {
      const token = localStorage.getItem("token");
      await booksApi.delete("/favorites/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { book },
      });
      setFavorites(favorites.filter((fav) => fav !== book));
      setMessage(`El libro "${book}" ha sido eliminado de tus favoritos.`);
    } catch (error) {
      console.error("Error al eliminar el favorito:", error);
      setMessage("No se pudo eliminar el libro. Inténtalo nuevamente.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Tus Libros Favoritos</h1>
      <Link
        to="/books"
        className="text-blue-500 hover:underline mb-4 block text-center"
      >
        ← Volver a la lista de libros
      </Link>

      {message && (
        <p className="text-center text-red-500 font-medium mb-4">{message}</p>
      )}

      {favorites.length === 0 ? (
        <p className="text-gray-500 text-center">
          No tienes libros en favoritos.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((book, index) => (
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
              <p className="text-gray-500 text-sm text-center">
                Género: {book.genre}
              </p>
              <button
                onClick={() => removeFavorite(book.title)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Eliminar de Favoritos
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
