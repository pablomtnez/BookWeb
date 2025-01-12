import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa los estilos globales
import App from './App'; // Importa el componente principal

const root = ReactDOM.createRoot(document.getElementById('root')); // Selecciona el elemento root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
