import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 상품 앱 빌드 설정.
 *
 * 설계 의도(history 스펙: "파일 크기 최소화 + 캐싱 최적화"):
 * (see docs/design-notes/0007-products-routing-and-lazyload.md)
 * - manualChunks 로 자주 안 바뀌는 벤더(react/router/mantine/query)를 분리한다.
 *   앱 코드만 바뀌면 벤더 청크는 해시가 유지되어 브라우저 캐시가 재사용된다.
 * - resolve.dedupe: 모노레포에서 react/mantine 인스턴스가 중복 번들되지 않도록 단일화한다.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks'],
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Vite 8(rolldown)은 manualChunks 를 함수 형태로 받는다. 벤더를 안정적으로 분리해
        // 앱 코드 변경 시에도 벤더 청크 해시가 유지되도록(=캐시 재사용) 한다.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mantine')) return 'mantine-vendor';
            if (id.includes('@tanstack')) return 'query-vendor';
            if (id.includes('react')) return 'react-vendor';
            // 방어적 catch-all: 현재 의존성에선 미도달. 새 라이브러리 추가 시 단일 vendor 청크로 모인다.
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
});
