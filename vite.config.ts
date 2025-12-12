import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente corrette per il 'mode' (development o production)
  const env = loadEnv(mode, process.cwd(), '');

  // 1. Usa la variabile VITE_PUBLIC_URL come base path per la build
  const basePath = env.VITE_PUBLIC_URL || '/';
  return ({
    plugins: [react()],
    build: {
      outDir: 'build', // O 'dist', a seconda di come lo chiami
    },
    // 2. IMPOSTA IL PERCORSO BASE GLOBALE
    base: basePath,

    // 3. Espone i tipi di import.meta.env nel progetto (opzionale ma consigliato)
    define: {
      'process.env.VITE_PUBLIC_URL': JSON.stringify(env.VITE_PUBLIC_URL)
      // Nota: Non è necessario definire REACT_APP_* perché Vite usa import.meta.env
    }
  })
});
