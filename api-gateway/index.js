const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const PORT = 3000;

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`Received request for ${req.url}`);
    next();
  });

// Proxy configuration
const proxyConfig = {
  '/api/notifications': {
    target: 'http://localhost:3003/api/notifications',
    changeOrigin: true,
  },
  '/api/orders': {
    target: 'http://localhost:3002/api/orders',
    changeOrigin: true,
  },
  '/api/products': {
    target: 'http://localhost:3004/api/products',
    changeOrigin: true,
  },
  '/api/users': {
    target: 'http://localhost:3001/api/users',
    changeOrigin: true,
    logLevel: 'debug'
  },
  '/websocket': {
    target: 'http://localhost:3003',
    changeOrigin: true,
    ws: true
  },
  '/socket.io': {  // Changed from /websocket to /socket.io
    target: 'http://localhost:3003',
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  }
};

// // Apply the proxy configuration
Object.keys(proxyConfig).forEach((context) => {
  const proxy = createProxyMiddleware(proxyConfig[context]);
  app.use(context, proxy);
    // Handle WebSocket upgrades for socket.io route
    if (context === '/socket.io') {
      server.on('upgrade', proxy.upgrade);
    }
  });

// Serve the React frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});