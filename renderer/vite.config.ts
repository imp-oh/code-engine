import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      // 键必须以斜线开始和结束
      '@': path.resolve(__dirname, './src'),
      '@public': path.resolve(__dirname, './public')
    },
  },
  optimizeDeps: {
    exclude: ['ce-core']
  },
  build: {
    emptyOutDir: true,
    outDir: '../public/web',
    rollupOptions: {
      output: {
        manualChunks: {

        }
      }
    }
  },
  server: {
    port: 8200,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        // target: 'https://www.xxxxx.top/api',
        target: process.env.NODE_ENV === 'production' ? 'https://www.xxxxx.top/api' : 'http://127.0.0.1:3301',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase' // 默认只支持驼峰，修改为同时支持横线和驼峰
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/index.scss";`
      }
    }
  },
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // 配置路劲在你的src里的svg存放文件
      iconDirs: [path.resolve(process.cwd(), './src/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
