import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * 로그인 앱 빌드 설정 (단일 패키지).
 *
 * 설계 의도:
 * - `@/` → src 경로 별칭(tsconfig paths 와 짝).
 * - 벤더 청크 분리: 앱 코드 변경 시에도 벤더 해시가 유지되어 캐시 재사용.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mantine')) return 'mantine-vendor';
            if (id.includes('@tanstack')) return 'query-vendor';
            if (id.includes('react')) return 'react-vendor';
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
});
