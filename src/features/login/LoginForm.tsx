import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Checkbox, PasswordInput, Stack, TextInput } from '@mantine/core';
import { HttpError } from '@/lib';
import { DEFAULT_VALUES, loginSchema, type LoginFormValues } from './schema';
import { useLogin } from './useLogin';
import type { LoginUser } from './api';

/**
 * 로그인 폼.
 *
 * 설계 의도:
 * - rhf + zod 로 검증, mode:'onChange' 로 입력 즉시 피드백. 제출 버튼은 formState.isValid 로 게이팅.
 * - 비동기/오류: 로딩(loading)·중복요청 방지(disabled)·자격오류(401)/일시오류(500) 분기 안내.
 */
export function LoginForm({ onLoggedIn }: { onLoggedIn: (user: LoginUser) => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });
  const mutation = useLogin(onLoggedIn);

  const onSubmit = (values: LoginFormValues) => {
    setErrorMessage(null);
    mutation.mutate(values, {
      onError: (error) => {
        setErrorMessage(
          error instanceof HttpError && error.status >= 500
            ? '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
            : '이메일/아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="이메일 또는 아이디"
          placeholder="test@artinus.dev"
          withAsterisk
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <PasswordInput
          label="비밀번호"
          placeholder="비밀번호"
          withAsterisk
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Checkbox label="로그인 상태 유지" {...register('rememberMe')} />

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        <Button type="submit" fullWidth loading={mutation.isPending} disabled={!isValid || mutation.isPending}>
          로그인
        </Button>
      </Stack>
    </form>
  );
}
