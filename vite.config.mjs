import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import path from 'node:path';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const isDev = mode === 'development';
    return {
        resolve: {
            alias: [
                // eslint-disable-next-line no-undef
                {find: '@', replacement: path.resolve(__dirname, './src')},
            ],
            extensions: ['.mjs', '.js', '.jsx', '.json', '.vue'],
        },
        plugins: [
            vue(),
        ],
        server: {
            port: 8081,
            cors: true,
        },
        build: {
            lib: {
                entry: './src/index.js',
                name: 'iview',
                fileName: 'iview',
                formats: ['es'],
            },
            rollupOptions: {
                external: ['vue', 'dayjs'],
            },
        },
        define: {
            'process.env': JSON.stringify({
                VERSION: pkg.version,
            }),
        }
    };
});
