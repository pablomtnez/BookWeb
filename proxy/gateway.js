require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const authService = process.env.AUTH_SERVICE || 'http://localhost:8000';
const bookService = process.env.BOOK_SERVICE || 'http://localhost:3001';
const port = process.env.GATEWAY_PORT || 4000;

const server = http.createServer((req, res) => {
    // Configuración de cabeceras CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejo de rutas
    if (req.url.startsWith('/auth')) {
        console.log(`[${new Date().toISOString()}] Redirecting to /auth`);
        proxy.web(req, res, { target: authService }, (err) => {
            console.error(`Error redirecting to /auth: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        });
    } else if (req.url.startsWith('/books')) {
        console.log(`[${new Date().toISOString()}] Redirecting to /books`);
        proxy.web(req, res, { target: bookService }, (err) => {
            console.error(`Error redirecting to /books: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        });
    } else {
        console.log(`[${new Date().toISOString()}] Unknown route: ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Manejo global de errores del proxy
proxy.on('error', (err, req, res) => {
    console.error(`Proxy error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: Unable to process the request.');
});

// Inicio del servidor
server.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
    console.log(`AUTH_SERVICE: ${authService}`);
    console.log(`BOOK_SERVICE: ${bookService}`);
});
