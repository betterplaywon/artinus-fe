import { createTheme, type MantineThemeOverride } from '@mantine/core';

/**
 * 서비스/앱별 브랜드 컬러. Mantine 기본 팔레트 키와 1:1로 매핑된다.
 * - 회원가입: community=violet(보라), news=green(초록), shopping=orange(주황)
 * - 상품: blue
 */
export type BrandColor = 'violet' | 'green' | 'orange' | 'blue';

/**
 * 공용 테마 팩토리.
 *
 * 설계 의도:
 * - "테마 차이 = primaryColor 한 값"으로 환원해, 서비스가 늘어도 색 토큰만 바꾸면 되도록 한다.
 *   (README의 "서비스별 테마"와 "확장성" 요구를 색상 축에서 구조적으로 해결)
 * - 폰트/라운드 등 나머지 디자인 토큰은 공통으로 묶어 일관성을 유지한다.
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
