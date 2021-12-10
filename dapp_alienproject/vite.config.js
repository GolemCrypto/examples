import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import inject from '@rollup/plugin-inject'
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    rollupOptions: {
      plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})

// export default defineConfig({
//   plugins: [vue()],
//   // build: {
//   //   sourcemap: true,
//   //   commonjsOptions: {
//   //     transformMixedEsModules: true,
//   //   },
//   // },
//   // esbuild: {
//   //   jsxFactory: 'jsx',
//   //   jsxInject: `import {jsx, css} from '@emotion/react'`,
//   // },
//   // define: {},
//   // optimizeDeps: {
//   //   exclude: ['@apollo/client', `graphql`],
//   //   include: ['*/@portis/**'],
//   // },
//   // resolve: {
//   //   alias: {
//   //     '~~': resolve(__dirname, 'src'),
//   //     /** browserify for web3 components */
//   //     stream: 'stream-browserify',
//   //     http: 'http-browserify',
//   //     https: 'http-browserify',
//   //     timers: 'timers-browserify',
//   //     process: 'process',
//   //   },
//   // },
// });