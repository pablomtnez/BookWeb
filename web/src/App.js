import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Books from "./components/Books";
import Favorites from "./components/Favorites";
import Auth from "./components/Auth";
import { FavoritesProvider } from "./FavoritesContext"; // Importar el contexto de favoritos

function App() {
  return (
    // Envolver toda la aplicación con el proveedor del contexto
    <FavoritesProvider>
      <Router>
        <Routes>
          {/* Redirigir a /auth por defecto */}
          <Route path="/" element={<Navigate to="/auth" />} />

          {/* Ruta de autenticación */}
          <Route path="/auth" element={<Auth />} />

          {/* Ruta de libros */}
          <Route path="/books" element={<Books />} />

          {/* Ruta de favoritos */}
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </Router>
    </FavoritesProvider>
  );
}

export default App;
