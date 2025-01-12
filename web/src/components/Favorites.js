import React from "react";
import { Link } from "react-router-dom";

const Favorites = ({ favorites }) => {
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
          No has añadido libros a favoritos aún.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((book, index) => (
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
              <p className="text-gray-700 text-sm text-center">
                Autor: {book.author}
              </p>
              <p className="text-gray-500 text-sm text-center">
                Género: {book.genre}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
