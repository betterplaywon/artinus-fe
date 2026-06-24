import { useState } from 'react';
import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { getCookie, removeCookie } from '@/lib';
import { AUTH_COOKIE } from './useLogin';
import { LoginForm } from './LoginForm';
import type { LoginUser } from './api';

/**
 * 로그인 페이지.
 *
 * 설계 의도:
 * - 새로고침 시 쿠키로 로그인 상태를 복원한다(토큰 존재 여부로 판단) → cookie 의 실제 용도 시연.
 * - 로그인 성공 시 환영 화면 + 로그아웃(쿠키 제거). 실제 진입 페이지는 과제 범위 외.
 */
export function LoginPage() {
  const [user, setUser] = useState<LoginUser | null>(() =>
    getCookie(AUTH_COOKIE) ? { id: 'restored', name: '사용자', identifier: '' } : null,
  );

  const handleLogout = () => {
    removeCookie(AUTH_COOKIE);
    setUser(null);
  };

  return (
    <Container size={420} py={64}>
      <Title order={1} ta="center" mb="lg">
        ARTINUS 로그인
      </Title>

      <Paper withBorder radius="md" p="lg">
        {user ? (
          <Stack gap="md">
            <Text fw={600}>로그인되었습니다 🎉</Text>
            <Text c="dimmed" size="sm">
              {user.identifier ? `${user.identifier} 님 환영합니다.` : '세션이 유지되고 있습니다.'}
            </Text>
            <Button variant="light" onClick={handleLogout}>
              로그아웃
            </Button>
          </Stack>
        ) : (
          <LoginForm onLoggedIn={setUser} />
        )}
      </Paper>

      <Text c="dimmed" size="xs" ta="center" mt="md">
        테스트 계정: <b>test@artinus.dev</b> 또는 <b>artinus_user</b> / 비밀번호 <b>password123</b>
      </Text>
    </Container>
  );
}
