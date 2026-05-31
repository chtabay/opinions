import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Déploiement sur GitHub Pages sous le sous-chemin /opinions/.
  // En dev local le serveur sert depuis la racine, mais le build de prod
  // doit préfixer les assets par /opinions/.
  base: '/opinions/',
  plugins: [react()],
  // Résolution native des alias définis dans tsconfig (ex. "@/*").
  // Remplace le plugin vite-tsconfig-paths depuis Vite 8.
  resolve: {
    tsconfigPaths: true,
  },
})
