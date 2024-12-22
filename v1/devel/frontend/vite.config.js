import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'

export default defineConfig(({ command, mode }) => {

    const env = loadEnv(mode, process.cwd(), '')
    const target = 'http://127.0.0.1:' + env.VITE_API_PORT
    const api = env.VITE_API_URL 
    const auth = env.VITE_AUTH_URL
    const admin = env.VITE_ADMIN_URL
    const socketio = env.VITE_SOCKETIO_URL

    return {
        base: env.VITE_ROOT_URL,
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src'),
            },
        },

        plugins: [
            react(),
            eslint(),
        ],

        build: {
            outDir: 'build',
            assetsDir: 'static'
        },

        server: {
            proxy: {
                [api]:      { target },
                [auth]:     { target },
                [admin]:    { target },
                [socketio]: { target, 'ws': true },
            }
        },
    }
})
