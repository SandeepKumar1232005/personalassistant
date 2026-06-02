/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src'),
      '@components': resolve(__dirname, 'src/renderer/src/components'),
      '@pages': resolve(__dirname, 'src/renderer/src/pages'),
      '@stores': resolve(__dirname, 'src/renderer/src/stores'),
      '@services': resolve(__dirname, 'src/renderer/src/services'),
      '@hooks': resolve(__dirname, 'src/renderer/src/hooks'),
      '@lib': resolve(__dirname, 'src/renderer/src/lib'),
      '@typings': resolve(__dirname, 'src/renderer/src/types')
    }
  }
})
