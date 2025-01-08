const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const port = 4000;

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/auth')) {
        console.log(`Incoming request to /auth: ${req.method} ${req.url}`);
        proxy.web(req, res, { target: 'http://localhost:8000' }, (err) => {
            console.error(`Error redirecting to /auth: ${err.message}`);
        });
    } else if (req.url.startsWith('/books')) {
        console.log(`Incoming request to /books: ${req.method} ${req.url}`);
        proxy.web(req, res, { target: 'http://localhost:3001' }, (err) => {
            console.error(`Error redirecting to /books: ${err.message}`);
        });
    } else {
        console.log(`Unknown route: ${req.method} ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
