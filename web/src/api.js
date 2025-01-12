import axios from 'axios';

// Configuración base para Axios
const api = axios.create({
    baseURL: 'http://localhost:8000', // URL del backend
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
