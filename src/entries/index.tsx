import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@/ui/styles.css';
import { createAppTheme } from '@/ui';
import { HubPage } from '@/signup/HubPage';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider theme={createAppTheme('violet')} defaultColorScheme="light">
      <HubPage />
    </MantineProvider>
  </StrictMode>,
);
