import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import Books from "./components/Books";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirigir a /auth por defecto */}
        <Route path="/" element={<Navigate to="/auth" />} />

        {/* Ruta de autenticación */}
        <Route path="/auth" element={<Auth />} />

        {/* Ruta protegida para la página de libros */}
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
