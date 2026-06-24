import { useEffect } from 'react';
import { Container, SimpleGrid, Text, Title } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { ErrorState, Spinner } from '@artinus/ui';
import { useProductsInfinite } from '../hooks/useProductsInfinite';
import { ProductCard } from '../components/ProductCard';

/**
 * 상품 목록 페이지 — 무한 스크롤(Lazy Load).
 *
 * 설계 의도:
 * - 스크롤 위치 계산 대신 IntersectionObserver(@mantine/hooks useIntersection)로 센티넬이
 *   뷰포트에 들어오면 다음 페이지를 요청한다. scroll 이벤트 throttle 보다 정확하고 저렴하다.
 * - rootMargin '200px': 바닥에 닿기 200px 전에 미리 로드해 체감 끊김을 줄인다.
 */
export function ProductListPage() {
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProductsInfinite();

  const { ref, entry } = useIntersection<HTMLDivElement>({ threshold: 0, rootMargin: '200px' });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <Spinner label="상품을 불러오는 중…" minHeight="60vh" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} minHeight="60vh" />;

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        상품
      </Title>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>

      {/* 무한 스크롤 센티넬 */}
      <div ref={ref} aria-hidden style={{ height: 1 }} />

      {isFetchingNextPage ? <Spinner label="더 불러오는 중…" minHeight={80} /> : null}
      {!hasNextPage ? (
        <Text c="dimmed" ta="center" mt="lg" size="sm">
          모든 상품을 불러왔어요.
        </Text>
      ) : null}
    </Container>
  );
}
