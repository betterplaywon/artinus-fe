import { Box, Image, Stack, Text, Title } from '@mantine/core';
import type { ServiceConfig } from '../services/types';

// 반응형 배너 높이(base 모바일 / sm 데스크톱). Mantine mobile-first style-prop. (ADR 0007)
const BANNER_HEIGHT = { base: 120, sm: 160 } as const;

/**
 * 서비스 소개 배너 + 페이지 타이틀.
 * banner.imageSrc 가 있으면 이미지를, 없으면 브랜드 컬러 그라데이션을 노출한다.
 */
export function ServiceBanner({ service }: { service: ServiceConfig }) {
  return (
    <Stack gap={4} mb="xl">
      {service.banner.imageSrc ? (
        <Image src={service.banner.imageSrc} alt={service.banner.alt} h={BANNER_HEIGHT} radius="md" />
      ) : (
        <Box
          h={BANNER_HEIGHT}
          role="img"
          aria-label={service.banner.alt}
          style={{
            borderRadius: 'var(--mantine-radius-md)',
            background: `linear-gradient(135deg, var(--mantine-color-${service.brandColor}-5), var(--mantine-color-${service.brandColor}-7))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Title order={2} c="white">
            {service.name}
          </Title>
        </Box>
      )}
      {/* 시맨틱 <h1>(order=1)은 유지하고 크기만 모바일에서 축소. Mantine Title 은 fz 만 바꾸면
          줄높이가 order 기준(1.3)으로 고정되므로 lh 를 함께 명시해 보정한다. */}
      <Title order={1} fz={{ base: 26, sm: 34 }} lh={{ base: 1.2, sm: 1.3 }} mt="md">
        {service.title}
      </Title>
      <Text c="dimmed">{service.subtitle}</Text>
    </Stack>
  );
}
