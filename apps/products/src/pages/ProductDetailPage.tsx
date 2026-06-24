import { Badge, Button, Container, Group, Image, Stack, Text, Title } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, Spinner } from '@artinus/ui';
import { useProduct } from '../hooks/useProduct';

// DummyJSON price 는 통화 단위가 없는 숫자 — 데모로 USD($) 표기를 가정한다.
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const IMG_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%25" height="100%25" fill="%23f1f3f5"/></svg>';

/** 상품 상세 페이지 — thumbnail, title, price, tags (요구사항 필드). */
export function ProductDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const { data, isPending, isError, refetch } = useProduct(id);

  if (!Number.isFinite(id) || id <= 0) {
    return <ErrorState title="잘못된 접근" message="존재하지 않는 상품입니다." minHeight="60vh" />;
  }
  if (isPending) return <Spinner label="상품 정보를 불러오는 중…" minHeight="60vh" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} minHeight="60vh" />;

  return (
    <Container size="sm" py="xl">
      <Button variant="subtle" mb="md" onClick={() => navigate('/')}>
        ← 목록으로
      </Button>

      <Stack gap="md">
        <Image
          src={data.thumbnail}
          alt={data.title}
          radius="md"
          h={320}
          fit="contain"
          loading="lazy"
          fallbackSrc={IMG_FALLBACK}
        />
        <Title order={1}>{data.title}</Title>
        <Text size="xl" fw={700}>
          {priceFormatter.format(data.price)}
        </Text>

        {data.tags.length > 0 ? (
          <Group gap="xs">
            {data.tags.map((tag) => (
              <Badge key={tag} variant="light">
                {tag}
              </Badge>
            ))}
          </Group>
        ) : null}

        {data.description ? <Text c="dimmed">{data.description}</Text> : null}
      </Stack>
    </Container>
  );
}
