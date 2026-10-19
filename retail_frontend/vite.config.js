import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 — configured via CSS (@import "tailwindcss" in index.css)
  ],
  server: {
    // The real Django backend allows CORS only from this origin.
    // Keep strictPort: true so the URL never changes unexpectedly.
    port: 5173,
    strictPort: true,
  },
})
