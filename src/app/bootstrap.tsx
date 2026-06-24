import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../lib';
import { createAppTheme } from '../ui';
import '@mantine/core/styles.css';
import '../ui/styles.css';
import type { ServiceKind } from '../services/types';
import { getServiceConfig } from '../services/registry';
import { SignupPage } from '../signup/SignupPage';

/**
 * 모든 서비스 엔트리가 공유하는 부트스트랩 (엔트리는 serviceKind 만 다르다 — ADR 0002).
 */
export async function bootstrap(serviceKind: ServiceKind): Promise<void> {
  // MSW 워커를 먼저 기동(await)한 뒤 렌더해, 첫 /api/verify 요청부터 모킹을 보장한다. (ADR 0006)
  const { worker } = await import('../mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });

  const service = getServiceConfig(serviceKind);
  const theme = createAppTheme(service.brandColor);
  const queryClient = createQueryClient();

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');

  createRoot(rootElement).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <QueryClientProvider client={queryClient}>
          <SignupPage service={service} />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  );
}
