import { Box, Image, Stack, Text, Title } from '@mantine/core';
import type { ServiceConfig } from '../services/types';

/**
 * 서비스 소개 배너 + 페이지 타이틀.
 * - banner.imageSrc 가 있으면 이미지를, 없으면 브랜드 컬러 그라데이션을 노출한다.
 *   (요구사항의 "타이틀(text) + 소개 배너(image)"를 서비스별로 다르게 표현)
 */
export function ServiceBanner({ service }: { service: ServiceConfig }) {
  return (
    <Stack gap={4} mb="xl">
      {service.banner.imageSrc ? (
        <Image src={service.banner.imageSrc} alt={service.banner.alt} h={140} radius="md" />
      ) : (
        <Box
          h={140}
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
      <Title order={1} mt="md">
        {service.title}
      </Title>
      <Text c="dimmed">{service.subtitle}</Text>
    </Stack>
  );
}
