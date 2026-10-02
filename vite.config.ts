import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/blog/',
  plugins: [vue()],
  build: {
    outDir: 'dist/blog',
  },
})
