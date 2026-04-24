const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.';
    if (req.url === '/') {
        filePath = './index.html';
    } else if (req.url === '/style.css' || req.url === '/script.js') {
        filePath = '.' + req.url;
    }

    if (req.method === 'GET' && filePath !== '.') {
        const extname = path.extname(filePath);
        let contentType = 'text/html';
        if (extname === '.css') contentType = 'text/css';
        if (extname === '.js') contentType = 'text/javascript';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    } else if (req.method === 'POST' && req.url === '/api/user') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'success', 
                message: 'Processed ' + data.name,
                serverTime: new Date().toLocaleTimeString()
            }));
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3000, () => {
    console.log('Server running: http://localhost:3000/');
});
