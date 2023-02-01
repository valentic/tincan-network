const { createProxyMiddleware } = require('http-proxy-middleware');

const port = process.env.REACT_APP_API_PORT 
const api = process.env.REACT_APP_API_URL 
const auth = process.env.REACT_APP_AUTH_URL
const socketio = process.env.REACT_APP_SOCKETIO_URL
const url = 'http://localhost:'+port.toString()

module.exports = function(app) {
    app.use(createProxyMiddleware(socketio, { 'target': url, 'ws': true }));
    app.use(createProxyMiddleware(api,      { 'target': url })); 
    app.use(createProxyMiddleware(auth,     { 'target': url })); 
};

