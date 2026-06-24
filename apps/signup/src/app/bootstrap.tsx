import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@artinus/lib';
import { createAppTheme } from '@artinus/ui';
import '@mantine/core/styles.css';
import '@artinus/ui/styles.css';
import type { ServiceId } from '../services/types';
import { getServiceConfig } from '../services/registry';
import { SignupPage } from '../signup/SignupPage';

/**
 * 모든 서비스 엔트리가 공유하는 부트스트랩.
 *
 * 설계 의도:
 * - 엔트리(community/news/shopping)는 serviceId 만 다르고 마운트 로직은 100% 공유한다.
 * - MSW 워커를 먼저 기동(await)한 뒤 렌더해, 첫 인증 요청부터 모킹이 보장되도록 한다.
 */
export async function bootstrap(serviceId: ServiceId): Promise<void> {
  const { worker } = await import('../mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });

  const service = getServiceConfig(serviceId);
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
