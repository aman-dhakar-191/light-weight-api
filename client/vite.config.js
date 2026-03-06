import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { almostnodePlugin } from 'almostnode/vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    almostnodePlugin(),
  ],
  resolve: {
    alias: {
      // Allow importing JSON data files from the project root /data folder
      '@data': path.resolve(__dirname, '../data'),
      // Provide browser shims for Node.js built-ins used by almostnode's deps
      'node:zlib': path.resolve(__dirname, 'src/shims/zlib.js'),
      'zlib': path.resolve(__dirname, 'src/shims/zlib.js'),
    },
  },
  optimizeDeps: {
    exclude: ['almostnode'],
  },
})
