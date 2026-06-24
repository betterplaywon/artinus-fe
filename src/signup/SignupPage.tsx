import { Container, Paper } from '@mantine/core';
import type { ServiceConfig } from '../services/types';
import { ServiceBanner } from './ServiceBanner';
import { SignupForm } from './SignupForm';

/** 회원가입 페이지 레이아웃 — 배너 + 폼 카드. (Container 가 모바일/데스크톱 폭을 대응) */
export function SignupPage({ service }: { service: ServiceConfig }) {
  return (
    <Container size={480} py="xl">
      <ServiceBanner service={service} />
      <Paper withBorder radius="md" p="lg">
        <SignupForm service={service} />
      </Paper>
    </Container>
  );
}
