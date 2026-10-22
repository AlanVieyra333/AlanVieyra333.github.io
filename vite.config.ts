import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Vite 8 resuelve los aliases de `tsconfig.json` de forma nativa, así
  // que el plugin `vite-tsconfig-paths` ya no hace falta.
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // Nombres de archivo con hash: GitHub Pages sirve con cache headers
    // largos, y el contenido nunca se invalida con el mismo nombre.
    assetsDir: 'assets',
  },
})
