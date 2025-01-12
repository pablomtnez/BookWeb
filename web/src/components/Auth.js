import React, { useState } from "react";
import { authApi } from "../api";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await authApi.post("/login", { email, password });
      localStorage.setItem("token", response.data.token);
      alert("Inicio de sesión exitoso");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h1>
      <div className="mb-6">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div className="mb-6">
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Iniciar Sesión
      </button>
    </div>
  );
};

export default Auth;
