import { Card, Image, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../api/types';

// DummyJSON price 는 통화 단위가 없는 숫자 — 데모로 USD($) 표기를 가정한다.
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 썸네일 로드 실패/지연 시 빈 영역 대신 보여줄 회색 플레이스홀더(외부 의존 없는 data URI).
const IMG_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%25" height="100%25" fill="%23f1f3f5"/></svg>';

/**
 * 상품 목록 카드.
 *
 * 설계 의도:
 * - Mantine 의 polymorphic `component={Link}` 대신 Link 로 감싼다.
 *   버전 조합에 따라 polymorphic 타입 추론이 흔들릴 수 있어, 명시적 래핑이 더 견고하다.
 * - 이미지 `loading="lazy"`: 뷰포트 밖 썸네일 디코딩을 지연해 초기 로드를 가볍게 한다.
 */
export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card withBorder radius="md" padding="sm" h="100%">
        <Card.Section>
          <Image
            src={product.thumbnail}
            alt={product.title}
            h={160}
            fit="contain"
            loading="lazy"
            fallbackSrc={IMG_FALLBACK}
          />
        </Card.Section>
        <Stack gap={4} mt="sm">
          <Text fw={600} size="sm" lineClamp={2}>
            {product.title}
          </Text>
          <Text fw={700}>{priceFormatter.format(product.price)}</Text>
        </Stack>
      </Card>
    </Link>
  );
}
