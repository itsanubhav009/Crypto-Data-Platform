const http = require('http');

const PORT = process.env.PORT || 8080;

// Ultra simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Worker test server running');
  console.log(`Received request: ${req.url}`);
});

// Start server immediately
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
