require('dotenv').config();
const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const authService = process.env.AUTH_SERVICE || 'http://127.0.0.1:8000';
const bookService = process.env.BOOK_SERVICE || 'http://127.0.0.1:3001';
const port = process.env.GATEWAY_PORT || 4000;

const server = http.createServer((req, res) => {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Cambiar a un dominio específico en producción
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Redirección de rutas
    if (req.url.startsWith('/auth')) {
        console.log(`[${new Date().toISOString()}] Redirecting to /auth`);
        proxy.web(req, res, { target: authService }, (err) => {
            console.error(`Error redirecting to /auth: ${err.message}`);
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Error communicating with auth service');
        });
    } else if (req.url.startsWith('/books')) {
        console.log(`[${new Date().toISOString()}] Redirecting to /books`);
        proxy.web(req, res, { target: bookService }, (err) => {
            console.error(`Error redirecting to /books: ${err.message}`);
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Error communicating with book service');
        });
    } else {
        console.log(`[${new Date().toISOString()}] Unknown route: ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Manejo de errores globales del proxy
proxy.on('error', (err, req, res) => {
    console.error(`Proxy error: ${err.message}`);
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Service Unavailable');
});

// Inicio del servidor
server.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
    console.log(`AUTH_SERVICE: ${authService}`);
    console.log(`BOOK_SERVICE: ${bookService}`);
});
