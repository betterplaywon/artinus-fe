import { Container, Paper } from '@mantine/core';
import type { ServiceConfig } from '../services/types';
import { ServiceBanner } from './ServiceBanner';
import { SignupForm } from './SignupForm';

/**
 * 회원가입 페이지 레이아웃 — 배너 + 폼 카드.
 *
 * 반응형:
 * - Container(size=480): max-width 480 + 중앙정렬 + 좌우 거터(md). 모바일은 풀폭으로 흐른다.
 * - 세로 패딩/카드 패딩은 모바일에서 줄여(좁은 폭의 가용 너비 확보·세로 스크롤 절약),
 *   sm 이상에서 키운다. 값을 mobile-first style-prop 으로 선언해 의도를 한눈에 읽히게 한다.
 *   (반응형 전략 see docs/design-notes/0007-responsive-mantine-style-props.md)
 */
export function SignupPage({ service }: { service: ServiceConfig }) {
  return (
    <Container size={480} py={{ base: 'md', sm: 'xl' }}>
      <ServiceBanner service={service} />
      <Paper withBorder radius="md" p={{ base: 'md', sm: 'lg' }}>
        <SignupForm service={service} />
      </Paper>
    </Container>
  );
}
