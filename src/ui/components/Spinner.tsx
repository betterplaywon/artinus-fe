import { Loader, Stack, Text } from '@mantine/core';
import { CenteredMessage } from './CenteredMessage';

export interface SpinnerProps {
  /** 스피너 아래 안내 문구(스크린리더에도 전달). */
  label?: string;
  minHeight?: number | string;
}

/**
 * 공용 로딩 인디케이터.
 * 접근성: role="status" + aria-live="polite" 로 비동기 로딩을 보조기기에 알린다.
 */
export function Spinner({ label, minHeight = 200 }: SpinnerProps) {
  return (
    <CenteredMessage minHeight={minHeight}>
      <Stack align="center" gap="xs" role="status" aria-live="polite">
        <Loader />
        {label && (
          <Text c="dimmed" size="sm">
            {label}
          </Text>
        )}
      </Stack>
    </CenteredMessage>
  );
}
