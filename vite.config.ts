import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tamaguiExtractPlugin } from '@tamagui/vite-plugin'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tamaguiExtractPlugin(),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
      '@tamagui/core/reset.css': resolve(__dirname, './node_modules/@tamagui/core/reset.css'),
      'react-native/Libraries/Utilities/codegenNativeComponent': resolve(__dirname, './node_modules/react-native-web/dist/vendor/react-native/Libraries/Utilities/codegenNativeComponent'),
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  define: {
    'process.env': {
      __DEV__: mode === 'development',
      NODE_ENV: JSON.stringify(mode),
    },
  },
}))
