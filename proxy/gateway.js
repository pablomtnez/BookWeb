require('dotenv').config();
const http = require('http');
const httpProxy = require('http-proxy');

// Configuración de servicios y puerto
const proxy = httpProxy.createProxyServer({});
const authService = process.env.AUTH_SERVICE || 'http://127.0.0.1:8000';
const bookService = process.env.BOOK_SERVICE || 'http://127.0.0.1:3001';
const port = process.env.GATEWAY_PORT || 4000;

// Creación del servidor HTTP
const server = http.createServer((req, res) => {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log(`[${new Date().toISOString()}] Incoming request:`);
    console.log(`  Method: ${req.method}`);
    console.log(`  URL: ${req.url}`);
    console.log(`  Headers: ${JSON.stringify(req.headers)}`);

    // Redirección específica para /auth
    if (req.url.startsWith('/auth')) {
        const target =
            req.url === '/auth/docs'
                ? `${authService}/docs`
                : `${authService}${req.url.replace('/auth', '')}`;
        console.log(`[${new Date().toISOString()}] Redirecting to ${target}`);
        proxy.web(req, res, { 
            target, 
            headers: { 'X-Forwarded-Host': req.headers.host } 
        }, (err) => {
            console.error(`Error redirecting to ${target}: ${err.message}`);
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Error communicating with auth service');
        });
    } 
    // Respuesta para rutas desconocidas
    else {
        console.log(`[${new Date().toISOString()}] Unknown route: ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Manejo de errores globales del proxy
proxy.on('error', (err, req, res) => {
    console.error(`[${new Date().toISOString()}] Proxy error: ${err.message}`);
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Service Unavailable');
});

// Inicio del servidor
server.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
    console.log(`AUTH_SERVICE: ${authService}`);
    console.log(`BOOK_SERVICE: ${bookService}`);
});
