import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Container size="sm" py="xl">
      <Stack align="center" justify="center" gap="md" mih="60vh">
        <Title order={1}>404</Title>
        <Text c="dimmed">페이지를 찾을 수 없어요.</Text>
        <Button onClick={() => navigate('/')}>상품 목록으로</Button>
      </Stack>
    </Container>
  );
}
