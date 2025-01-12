import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Books from "./components/Books";
import Favorites from "./components/Favorites";
import Auth from "./components/Auth";

function App() {
  const [favorites, setFavorites] = useState([]); // Estado global para favoritos

  return (
    <Router>
      <Routes>
        {/* Redirigir a /auth por defecto */}
        <Route path="/" element={<Navigate to="/auth" />} />

        {/* Ruta de autenticación */}
        <Route path="/auth" element={<Auth />} />

        {/* Ruta de libros */}
        <Route
          path="/books"
          element={<Books favorites={favorites} setFavorites={setFavorites} />}
        />

        {/* Ruta de favoritos */}
        <Route path="/favorites" element={<Favorites favorites={favorites} />} />
      </Routes>
    </Router>
  );
}

export default App;
