import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./components/Home";
import ProtectedPage from "./components/ProtectedPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para autenticación */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Ruta para la página principal */}
        <Route path="/" element={<Home />} />

        {/* Ruta protegida */}
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
