import { createTheme, type MantineThemeOverride } from '@mantine/core';

/**
 * 앱 테마 팩토리.
 *
 * 설계 의도:
 * - 단일 앱이므로 서비스별 브랜드 분기 없이 하나의 테마를 둔다.
 * - primaryColor 는 Mantine 기본 팔레트 키(기본 indigo). 폰트/라운드 등 공통 토큰을 묶는다.
 */
export function createAppTheme(primaryColor = 'indigo'): MantineThemeOverride {
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
