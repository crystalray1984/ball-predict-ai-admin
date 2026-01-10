import vue from '@vitejs/plugin-vue'
import { resolve, sep } from 'node:path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
    base: '',
    build: {
        outDir: './dist/rec02812713/',
    },
    plugins: [vue(), vueJsx()],
    resolve: {
        alias: [
            {
                find: /@\//,
                replacement: resolve(__dirname, './src') + sep,
            },
        ],
    },
    server: {
        proxy: {
            '/api/': {
                // target: 'http://127.0.0.1:8000',
                target: 'https://v3.188zq.vip',
                changeOrigin: true,
            },
            '/admin/': {
                // target: 'http://127.0.0.1:8000',
                target: 'https://v3.188zq.vip',
                changeOrigin: true,
            },
        },
    },
})
