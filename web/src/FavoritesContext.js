import React, { createContext, useState, useEffect, useCallback } from "react";
import { booksApi } from "./api";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar favoritos
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[LOG] Cargando favoritos...");
      const response = await booksApi.get("/favorites");
      setFavorites(response.data.favorites || []);
      console.log("[LOG] Favoritos cargados:", response.data.favorites);
    } catch (error) {
      console.error("[ERROR] Error al cargar favoritos:", error);
      alert("Error al cargar favoritos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para añadir a favoritos
  const addToFavorites = async (book) => {
    try {
      // Verificar si el libro ya está en favoritos
      if (favorites.some((fav) => fav.title === book.title)) {
        console.warn("[WARN] El libro ya está en favoritos:", book.title);
        alert("Este libro ya está en tu lista de favoritos.");
        return;
      }

      console.log("[LOG] Añadiendo a favoritos:", book);
      const response = await booksApi.post("/favorites/add", { book: book.title });
      console.log("[LOG] Respuesta del backend:", response.data);

      // Actualizar el estado de favoritos
      setFavorites((prev) => [...prev, book]);
      alert(`"${book.title}" ha sido añadido a favoritos.`);
    } catch (error) {
      console.error("[ERROR] Error al añadir a favoritos:", error);
      alert("Error al añadir a favoritos. Intenta nuevamente.");
    }
  };

  // Función para eliminar de favoritos
  const removeFavorite = async (book) => {
    try {
      console.log("[LOG] Eliminando de favoritos:", book);
      const response = await booksApi.delete("/favorites/delete", { data: { book: book.title } });
      console.log("[LOG] Respuesta del backend:", response.data);

      // Actualizar el estado de favoritos
      setFavorites((prev) => prev.filter((fav) => fav.title !== book.title));
      alert(`"${book.title}" ha sido eliminado de favoritos.`);
    } catch (error) {
      console.error("[ERROR] Error al eliminar el favorito:", error);
      alert("Error al eliminar el favorito. Intenta nuevamente.");
    }
  };

  // Cargar favoritos al iniciar
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, fetchFavorites, addToFavorites, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
