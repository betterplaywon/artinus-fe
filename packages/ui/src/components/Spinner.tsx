import { Loader, Stack, Text } from '@mantine/core';
import { CenteredMessage } from './CenteredMessage';

export interface SpinnerProps {
  /** 스피너 아래에 함께 노출할 안내 문구 (스크린리더에도 전달됨). */
  label?: string;
  minHeight?: number | string;
}

/**
 * 공용 로딩 인디케이터.
 *
 * 설계 의도:
 * - 두 앱의 "데이터 로딩 중 표시" 요구를 한 컴포넌트로 충족한다.
 * - 접근성: role="status" + aria-live="polite" 로 비동기 로딩을 보조기기에 알린다.
 */
export function Spinner({ label, minHeight = 200 }: SpinnerProps) {
  return (
    <CenteredMessage minHeight={minHeight}>
      <Stack align="center" gap="xs" role="status" aria-live="polite">
        <Loader />
        {label ? (
          <Text c="dimmed" size="sm">
            {label}
          </Text>
        ) : null}
      </Stack>
    </CenteredMessage>
  );
}
