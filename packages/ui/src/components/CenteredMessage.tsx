import { Center, type MantineStyleProps } from '@mantine/core';
import type { ReactNode } from 'react';

interface CenteredMessageProps extends MantineStyleProps {
  children: ReactNode;
  minHeight?: number | string;
}

/** 로딩/에러/빈 상태를 화면 중앙에 배치하기 위한 공통 레이아웃 프리미티브. */
export function CenteredMessage({ children, minHeight = 200, ...style }: CenteredMessageProps) {
  return (
    <Center mih={minHeight} {...style}>
      {children}
    </Center>
  );
}
