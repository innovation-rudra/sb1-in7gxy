import { Server } from 'socket.io';

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Initializing socket server...');
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

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

  console.log('Socket server initialized');
  res.end();
}