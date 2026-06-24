import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Anchor,
  Badge,
  Card,
  Container,
  Group,
  MantineProvider,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { createAppTheme } from '@artinus/ui';
import '@mantine/core/styles.css';
import '@artinus/ui/styles.css';
import { SERVICES } from '../services/registry';

/** 개발/데모용 허브 — 서비스별 독립 HTML 로 이동하는 링크 모음. */
function Hub() {
  return (
    <Container size={560} py="xl">
      <Title order={1} mb="xs">
        회원가입 데모
      </Title>
      <Text c="dimmed" mb="xl">
        각 서비스는 라우팅이 아닌 독립 HTML 빌드로 분리됩니다 (community/news/shopping.html).
      </Text>
      <Stack>
        {Object.values(SERVICES).map((service) => (
          <Anchor key={service.id} href={`./${service.id}.html`} underline="never" c="inherit">
            <Card withBorder radius="md" padding="lg">
              <Group justify="space-between">
                <div>
                  <Title order={3}>{service.name}</Title>
                  <Text c="dimmed" size="sm">
                    {service.title}
                  </Text>
                </div>
                <Badge color={service.brandColor} variant="light">
                  {service.brandColor}
                </Badge>
              </Group>
            </Card>
          </Anchor>
        ))}
      </Stack>
    </Container>
  );
}

const theme = createAppTheme('violet');
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Hub />
    </MantineProvider>
  </StrictMode>,
);
