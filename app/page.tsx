"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Button } from "@/components/ui/button";
import SpeedGauge from '@/components/SpeedGauge';

export default function Home() {
  const [pingSpeed, setPingSpeed] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [testing, setTesting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to the server. Please try again.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startTest = () => {
    setTesting(true);
    setError('');
    setPingSpeed(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);

    if (socket) {
      console.log('Starting test...');
      let downloadStart, uploadStart;

      // Ping test
      const pingStart = Date.now();
      socket.emit('ping');
      socket.once('pong', () => {
        const pingTime = Date.now() - pingStart;
        console.log('Ping time:', pingTime);
        setPingSpeed(pingTime);

        // Start download test
        console.log('Starting download test...');
        downloadStart = Date.now();
        socket.emit('downloadTest', { chunkSize: 1024 * 1024 }); // 1MB chunk
      });

      socket.on('downloadChunk', (data) => {
        if (downloadStart) {
          const downloadTime = (Date.now() - downloadStart) / 1000; // seconds
          const speed = (data.length / downloadTime / 1024 / 1024) * 8; // Mbps
          console.log('Download speed:', speed);
          setDownloadSpeed(speed);

          // Start upload test
          console.log('Starting upload test...');
          uploadStart = Date.now();
          socket.emit('uploadTest', { chunkSize: 1024 * 1024 }); // 1MB chunk
        }
      });

      socket.on('uploadComplete', (data) => {
        if (uploadStart) {
          const uploadTime = (Date.now() - uploadStart) / 1000; // seconds
          const speed = (data.size / uploadTime / 1024 / 1024) * 8; // Mbps
          console.log('Upload speed:', speed);
          setUploadSpeed(speed);
          setTesting(false);
        }
      });

      socket.on('testError', (errorMessage) => {
        console.error('Test error:', errorMessage);
        setError(`An error occurred during the test: ${errorMessage}`);
        setTesting(false);
      });
    } else {
      setError('Socket not connected. Please refresh the page and try again.');
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-2">Test Your Internet Speed</h1>
      <p className="text-center mb-8 text-gray-300">
        Find out how fast your internet connection, measure ping time in millisecond, maximum download and upload speed in
        Megabits per second (Mbps) unit
      </p>
      <div className="flex flex-wrap justify-center gap-8 mb-8">
        <SpeedGauge label="Ping Speed" value={pingSpeed} max={3000} unit="ms" color="blue" />
        <SpeedGauge label="Download Speed" value={downloadSpeed} max={1000} unit="Mbps" color="green" />
        <SpeedGauge label="Upload Speed" value={uploadSpeed} max={1000} unit="Mbps" color="purple" />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button
        className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        onClick={startTest}
        disabled={testing}
      >
        {testing ? 'Testing...' : 'Start Testing'}
      </Button>
    </div>
  );
}