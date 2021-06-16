import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { svgBuilder } from './src/plugins/svgBuilder'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['axios'],
  },
  plugins: [vue(), svgBuilder('./src/icons/svg/')],
  server: {
    // host: '0.0.0.0',
    port: 9200,
    open: true,
    cors: true, // 为开发服务器配置 CORS。默认启用并允许任何源，传递一个 选项对象 来调整行为或设为 false 表示禁用。
    proxy: {
      '/api': {
        target: `http://218.108.205.54:80/api`, // 线上
        // target: `http://192.168.1.119:8079`, // 线下
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
