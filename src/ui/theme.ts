import { createTheme, type MantineThemeOverride } from '@mantine/core';

/** 서비스 브랜드 컬러. Mantine 기본 팔레트 키와 1:1. (community=violet, news=green, shopping=orange) */
export type BrandColor = 'violet' | 'green' | 'orange';

/**
 * 공용 테마 팩토리. 서비스 간 차이는 primaryColor 한 값뿐이고 나머지 토큰은 공통이다.
 * (테마 확장 전략은 README '확장성 설계' 참조)
 */
export function createAppTheme(primaryColor: BrandColor): MantineThemeOverride {
  return createTheme({
    primaryColor,
    defaultRadius: 'md',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", "Segoe UI", Roboto, sans-serif',
    headings: {
      fontWeight: '700',
    },
  });
}
