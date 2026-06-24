import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * 회원가입 앱 빌드 설정 — 멀티엔트리(MPA).
 *
 * 설계 의도(README: "라우팅 기반 분리가 아닌, 서비스별 독립 HTML 산출물"):
 * - rollupOptions.input 에 서비스별 HTML 을 등록해 dist/community.html, dist/news.html,
 *   dist/shopping.html 이 각각 독립 번들로 생성된다.
 * - 새 서비스 추가 = HTML 1개 + 엔트리 1개 + 레지스트리 항목 1개. (핵심 로직은 공유)
 * - `@/` → src 경로 별칭. (see docs/design-notes/0002-multi-entry-independent-html.md)
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(root, 'src') },
    dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks'],
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        community: resolve(root, 'community.html'),
        news: resolve(root, 'news.html'),
        shopping: resolve(root, 'shopping.html'),
      },
    },
  },
});
