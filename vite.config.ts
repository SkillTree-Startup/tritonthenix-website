import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tamaguiExtractPlugin } from '@tamagui/vite-plugin'

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
  define: {
    'process.env': {
      TEST_NATIVE_PLATFORM: JSON.stringify(process.env.TEST_NATIVE_PLATFORM),
      NODE_ENV: JSON.stringify(mode)
    }
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
}))
