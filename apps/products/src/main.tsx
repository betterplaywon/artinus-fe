import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { createAppTheme } from '@artinus/ui';
import { createQueryClient } from '@artinus/lib';
import '@mantine/core/styles.css';
import '@artinus/ui/styles.css';
import { router } from './router';

const theme = createAppTheme('blue');
const queryClient = createQueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
