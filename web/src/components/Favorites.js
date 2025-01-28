import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../FavoritesContext"; // Importar el contexto de favoritos

const Favorites = () => {
  const { favorites, removeFavorite } = useContext(FavoritesContext); // Acceso al contexto de favoritos

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Tus Libros Favoritos</h1>
      <Link
        to="/books"
        className="text-blue-500 hover:underline mb-4 block text-center"
      >
        ← Volver a la lista de libros
      </Link>

      {favorites.length === 0 ? (
        <p className="text-gray-500 text-center">
          No tienes libros en favoritos.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((book, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center border border-gray-200"
            >
              <div className="w-40 h-56 mb-4 flex items-center justify-center bg-gray-100 rounded">
                <img
                  src={book.image ? book.image : "/placeholder.png"}
                  alt={book.title}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => (e.target.src = "/placeholder.png")} // Manejo de errores de imagen
                />
              </div>
              <h2 className="text-xl font-semibold text-center">{book.title}</h2>
              <p className="text-gray-700 text-sm text-center">
                Autor: {book.author || "Desconocido"}
              </p>
              <p className="text-gray-500 text-sm text-center">
                Género: {book.genre || "No especificado"}
              </p>
              <button
                onClick={() => removeFavorite(book)} // Usar el contexto para eliminar favoritos
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
