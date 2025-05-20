import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
    base: '',
    plugins: [vue(), vueJsx()],
    resolve: {
        alias: [
            {
                find: /@\//,
                replacement: pathToFileURL(resolve(__dirname, './src') + '/').href,
            },
        ],
    },
})
