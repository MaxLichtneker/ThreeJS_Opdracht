import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/discogs-img': {
        target: 'https://i.discogs.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/discogs-img/, '')
      }
    }
  }
})