const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('ping', () => {
      console.log('Received ping request');
      socket.emit('pong');
    });

    socket.on('downloadTest', (data) => {
      console.log('Starting download test');
      try {
        const chunk = Buffer.alloc(data.chunkSize);
        socket.emit('downloadChunk', chunk);
      } catch (error) {
        console.error('Error in download test:', error);
        socket.emit('testError', 'Download test failed');
      }
    });

    socket.on('uploadTest', (data) => {
      console.log('Starting upload test');
      const startTime = Date.now();
      socket.once('uploadComplete', () => {
        try {
          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000; // seconds
          socket.emit('uploadComplete', { size: data.chunkSize, duration });
        } catch (error) {
          console.error('Error in upload test:', error);
          socket.emit('testError', 'Upload test failed');
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});