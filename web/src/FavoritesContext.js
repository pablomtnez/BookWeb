import React, { createContext, useState, useCallback } from "react";
import { authApi } from "./api";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar favoritos después del login
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[LOG] Cargando favoritos...");
      const response = await authApi.get("/favorites");

      console.log("[LOG] Respuesta de la API /favorites:", response.data);

      // Verificamos si la respuesta tiene la estructura correcta
      if (response.data.favorites && Array.isArray(response.data.favorites)) {
        setFavorites(response.data.favorites);
      } else {
        console.warn("[WARN] Estructura inesperada en la respuesta de favoritos.");
        setFavorites([]);
      }

      console.log("[LOG] Favoritos cargados:", response.data.favorites);
    } catch (error) {
      console.error("[ERROR] Error al cargar favoritos:", error);
      alert("Error al cargar favoritos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Se eliminó `favorites` de las dependencias para evitar loops innecesarios

  // Función para añadir a favoritos
  const addToFavorites = async (book) => {
    try {
      // Verificar si el libro ya está en favoritos
      if (favorites.some((fav) => fav.title === book.title)) {
        console.warn("[WARN] El libro ya está en favoritos:", book.title);
        alert("Este libro ya está en tu lista de favoritos.");
        return;
      }

      console.log("[LOG] Añadiendo a favoritos:", { book: book.title });
      const response = await authApi.post("/favorites/add", { book: book.title });
      console.log("[LOG] Respuesta del backend:", response.data);

      // Actualizar el estado de favoritos
      setFavorites((prev) => [...prev, book]);
      alert(`"${book.title}" ha sido añadido a favoritos.`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.warn("[WARN] El libro ya estaba en favoritos.");
        alert("Este libro ya está en tu lista de favoritos.");
      } else {
        console.error("[ERROR] Error al añadir a favoritos:", error.response?.data || error.message);
        alert("Error al añadir a favoritos. Intenta nuevamente.");
      }
    }
  };

  // Función para eliminar de favoritos
  const removeFavorite = async (book) => {
    try {
      console.log("[LOG] Eliminando de favoritos:", { book: book.title });
      const response = await authApi.delete("/favorites/delete", { data: { book: book.title } });
      console.log("[LOG] Respuesta del backend:", response.data);

      // Actualizar el estado de favoritos
      setFavorites((prev) => prev.filter((fav) => fav.title !== book.title));
      alert(`"${book.title}" ha sido eliminado de favoritos.`);
    } catch (error) {
      console.error("[ERROR] Error al eliminar el favorito:", error.response?.data || error.message);
      alert("Error al eliminar el favorito. Intenta nuevamente.");
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, fetchFavorites, addToFavorites, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;
