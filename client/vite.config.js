import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Automatically detect the backend port from server/.env, environment variables, or fallback to 5014/5000
function getBackendTarget() {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.PORT) return `http://localhost:${process.env.PORT}`;

  try {
    const serverEnvPath = path.resolve(__dirname, '../server/.env');
    if (fs.existsSync(serverEnvPath)) {
      const content = fs.readFileSync(serverEnvPath, 'utf8');
      const portMatch = content.match(/^PORT\s*=\s*(\d+)/m);
      if (portMatch && portMatch[1]) {
        return `http://localhost:${portMatch[1]}`;
      }
    }
  } catch (e) {
    // fallback below
  }

  return 'http://localhost:5014';
}

const backendTarget = getBackendTarget();

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to local network (accessible via LAN IP / on phone)
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/media': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
