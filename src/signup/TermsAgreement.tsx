import { useFormContext, useWatch } from 'react-hook-form';
import { Checkbox, Divider, Stack, Text } from '@mantine/core';
import type { TermKey } from '../services/types';
import type { SignupFormValues } from './schema';
import { TERM_DEFS } from './terms';

/**
 * 약관 동의 — 전체 ↔ 개별 동기화.
 *
 * 설계 의도:
 * - 약관 동의값을 모두 폼 필드로 두고(setValue), 필수 약관은 스키마에서 true 를 강제한다.
 *   → "필수 약관 미동의 시 가입 불가"가 formState.isValid 로 자동 반영된다.
 * - 전체 동의 체크박스는 indeterminate 로 부분 선택 상태를 시각화한다.
 */
export function TermsAgreement({ terms }: { terms: TermKey[] }) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<SignupFormValues>();

  // 약관 키만 구독 — 무관한 입력 타이핑이 약관 영역을 리렌더하지 않도록 범위를 좁힌다.
  const watched = useWatch({ control, name: terms });
  const isChecked = (index: number) => watched[index] === true;
  const allChecked = terms.every((_term, index) => isChecked(index));
  const someChecked = terms.some((_term, index) => isChecked(index));

  const setTerm = (key: TermKey, checked: boolean) =>
    setValue(key, checked, { shouldValidate: true, shouldDirty: true });

  const toggleAll = (checked: boolean) => {
    for (const key of terms) setTerm(key, checked);
  };

  return (
    <Stack gap="xs">
      <Checkbox
        label={<Text fw={600}>전체 동의</Text>}
        checked={allChecked}
        indeterminate={someChecked && !allChecked}
        onChange={(event) => toggleAll(event.currentTarget.checked)}
      />
      <Divider />
      {terms.map((key, index) => {
        const def = TERM_DEFS[key];
        return (
          <Checkbox
            key={key}
            checked={isChecked(index)}
            error={errors[key]?.message}
            onChange={(event) => setTerm(key, event.currentTarget.checked)}
            label={
              <Text size="sm">
                <Text span c={def.required ? 'red' : 'dimmed'} inherit>
                  {def.required ? '(필수)' : '(선택)'}
                </Text>{' '}
                {def.label}
              </Text>
            }
            description={def.summary}
          />
        );
      })}
    </Stack>
  );
}
