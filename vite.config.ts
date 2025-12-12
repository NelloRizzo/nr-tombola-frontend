import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // Carica le variabili d'ambiente corrette per il 'mode' (development o production)
  return ({
    plugins: [react()],
    build: {
      outDir: 'build', // O 'dist', a seconda di come lo chiami
    },
  })
});
