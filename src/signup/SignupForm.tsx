import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Stack } from '@mantine/core';
import type { ServiceConfig } from '../services/types';
import { buildSignupSchema, DEFAULT_VALUES, type SignupFormValues } from './schema';
import { FIELD_COMPONENTS } from './fieldRegistry';
import { TermsAgreement } from './TermsAgreement';

/**
 * 회원가입 폼 셸.
 *
 * 설계 의도:
 * - 서비스 설정(fields/terms)을 순회해 입력/약관을 렌더한다. 폼 자체는 서비스에 무지하다.
 * - 스키마는 설정에서 동적 합성하고 react-hook-form + zodResolver 로 검증한다.
 * - 제출 버튼은 formState.isValid 로만 게이팅 → "필수 입력 + 인증 + 필수 약관"이 한 값에 수렴.
 * - mode:'onChange' 로 입력 즉시 검증해 사용자에게 빠른 피드백을 준다.
 */
export function SignupForm({ service }: { service: ServiceConfig }) {
  const [submitted, setSubmitted] = useState(false);
  const schema = useMemo(() => buildSignupSchema(service), [service]);

  const methods = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  // 실제 가입 처리는 과제 범위 외 — 유효성 통과를 확인하는 데모 동작만 수행.
  const onSubmit = () => setSubmitted(true);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="lg">
          {service.fields.map((key) => {
            const Field = FIELD_COMPONENTS[key];
            return <Field key={key} />;
          })}

          <TermsAgreement terms={service.terms} />

          {submitted && (
            <Alert color="green" title="가입 정보 검증 완료">
              모든 필수 입력·인증·약관이 유효합니다.
            </Alert>
          )}

          <Button type="submit" size="md" fullWidth disabled={!isValid}>
            가입하기
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}
