import { Box, Image, Stack, Text, Title } from '@mantine/core';
import type { ServiceConfig } from '../services/types';

// 반응형 배너 높이 — 모바일에선 낮춰(above-the-fold 확보), 데스크톱에선 키운다.
// Mantine mobile-first style-prop 객체: base=모든 화면, sm 이상에서 min-width 미디어로 덮어쓴다.
const BANNER_HEIGHT = { base: 120, sm: 160 } as const;

/**
 * 서비스 소개 배너 + 페이지 타이틀.
 * - banner.imageSrc 가 있으면 이미지를, 없으면 브랜드 컬러 그라데이션을 노출한다.
 *   (요구사항의 "타이틀(text) + 소개 배너(image)"를 서비스별로 다르게 표현)
 * - 높이/타이틀 크기는 화면폭에 따라 스케일한다(반응형). 별도 CSS/미디어쿼리 없이
 *   Mantine 반응형 style-prop 으로 표현해 의도를 한곳에서 읽히게 한다.
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
      {/* order=1 로 시맨틱 <h1> 은 유지하되, 폰트 크기/줄높이만 모바일에서 축소(34→26px).
          lh 를 fz 와 짝지어 작은 폰트에서 줄간격이 헐거워 보이지 않게 한다(Title 의 줄높이는
          order 에 묶여 fz 만 바꾸면 1.3 으로 고정되므로 명시 보정). */}
      <Title order={1} fz={{ base: 26, sm: 34 }} lh={{ base: 1.2, sm: 1.3 }} mt="md">
        {service.title}
      </Title>
      <Text c="dimmed">{service.subtitle}</Text>
    </Stack>
  );
}
