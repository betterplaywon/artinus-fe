import { Container, Paper } from '@mantine/core';
import type { ServiceConfig } from '../services/types';
import { ServiceBanner } from './ServiceBanner';
import { SignupForm } from './SignupForm';

/**
 * 회원가입 페이지 레이아웃 — 배너 + 폼 카드.
 * Container(size=480)로 가독 폭을 캡하고, 세로/카드 패딩은 mobile-first style-prop 으로 스케일한다. (ADR 0007)
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
