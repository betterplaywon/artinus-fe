import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import '@/ui/styles.css';
import { createAppTheme } from '@/ui';
import { createQueryClient } from '@/lib';
import { LoginPage } from '@/features/login/LoginPage';

/**
 * 부트스트랩: MSW 워커를 먼저 기동(await)한 뒤 렌더 → 첫 로그인 요청부터 모킹이 보장된다.
 */
async function bootstrap(): Promise<void> {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });

  const theme = createAppTheme();
  const queryClient = createQueryClient();

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');

  createRoot(rootElement).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <QueryClientProvider client={queryClient}>
          <LoginPage />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  );
}

void bootstrap();
