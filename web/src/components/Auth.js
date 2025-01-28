import React, { useState, useContext } from "react";
import { authApi } from "../api";
import { useNavigate } from "react-router-dom"; // Para redirección
import { FavoritesContext } from "../FavoritesContext"; // Importar el contexto de favoritos

const Auth = () => {
  const { fetchFavorites } = useContext(FavoritesContext); // Acceder a fetchFavorites
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Hook para redirección

  // Validar correo electrónico
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setMessage("Por favor, introduce un correo electrónico válido.");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      if (isLogin) {
        // Enviar datos en formato x-www-form-urlencoded
        const data = new URLSearchParams();
        data.append("username", formData.email);
        data.append("password", formData.password);

        const response = await authApi.post("/login", data, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        localStorage.setItem("token", response.data.access_token);
        setMessage("Inicio de sesión exitoso.");

        fetchFavorites(); // 🔹 Cargar favoritos después del login
        navigate("/books"); // Redirige a Books.js
      } else {
        const response = await authApi.post("/register", {
          name: formData.name,
          username: formData.email,
          password: formData.password,
        });

        setMessage(response.data.message || "Registro exitoso.");
      }
    } catch (error) {
      const errorData = error.response?.data;

      // Evita el error "Objects are not valid as a React child"
      if (Array.isArray(errorData)) {
        setMessage(
          errorData.map((err) => `${err.loc?.join(" -> ")}: ${err.msg}`).join(", ")
        );
      } else {
        setMessage(
          typeof errorData?.detail === "string"
            ? errorData.detail
            : "Ocurrió un error, por favor intenta nuevamente."
        );
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? "Inicio de Sesión" : "Registro"}
        </h2>
        {message && (
          <div className={`text-center font-medium mb-4 ${isLogin ? "text-green-500" : "text-red-500"}`}>
            <p>{message}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Nombre:
              </label>
              <input
                type="text"
                name="name"
                placeholder="Introduce tu nombre"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email:
            </label>
            <input
              type="email"
              name="email"
              placeholder="Introduce tu correo electrónico"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Contraseña:
            </label>
            <input
              type="password"
              name="password"
              placeholder="Introduce tu contraseña"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirmar Contraseña:
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-blue-500 hover:underline block text-center"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
