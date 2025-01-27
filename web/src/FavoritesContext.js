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
      const response = await booksApi.get("/favorites");
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para añadir a favoritos
  const addToFavorites = async (book) => {
    try {
      await booksApi.post("/favorites/add", { book: book.title });
      setFavorites((prev) => [...prev, book]);
    } catch (error) {
      console.error("Error al añadir a favoritos:", error);
    }
  };

  // Función para eliminar de favoritos
  const removeFavorite = async (book) => {
    try {
      await booksApi.delete("/favorites/delete", { data: { book: book.title } });
      setFavorites((prev) => prev.filter((fav) => fav.title !== book.title));
    } catch (error) {
      console.error("Error al eliminar el favorito:", error);
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
