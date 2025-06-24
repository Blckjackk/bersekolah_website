import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    esbuild: {
      target: 'es2020'
    },
    server: {
      host: true,
      proxy: {
        // Proxy API requests to your Laravel backend
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    envPrefix: 'PUBLIC_'
  },

  integrations: [react()],
});