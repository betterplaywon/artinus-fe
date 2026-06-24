import { Button, Stack, Text } from '@mantine/core';
import { CenteredMessage } from './CenteredMessage';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  /** 제공 시 "다시 시도" 버튼을 노출한다. */
  onRetry?: () => void;
  minHeight?: number | string;
}

/**
 * 공용 에러 상태 UI.
 *
 * 설계 의도:
 * - 비동기 실패를 사용자에게 일관된 형태로 안내하고, 회복 동작(재시도)을 한 자리에서 제공한다.
 *   (평가 항목 "비동기 처리 및 오류 대응"을 공통 컴포넌트로 표준화)
 */
export function ErrorState({
  title = '문제가 발생했어요',
  message = '잠시 후 다시 시도해 주세요.',
  onRetry,
  minHeight = 200,
}: ErrorStateProps) {
  return (
    <CenteredMessage minHeight={minHeight}>
      <Stack align="center" gap="sm" role="alert">
        <Text fw={600}>{title}</Text>
        <Text c="dimmed" size="sm" ta="center">
          {message}
        </Text>
        {onRetry ? (
          <Button variant="light" onClick={onRetry}>
            다시 시도
          </Button>
        ) : null}
      </Stack>
    </CenteredMessage>
  );
}
