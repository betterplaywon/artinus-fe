import type { TermKey } from '../services/types';

export interface TermDef {
  key: TermKey;
  label: string;
  required: boolean;
  /** 펼쳐보기용 약관 요약 문구(내용은 자유롭게 작성). */
  summary: string;
}

/** 약관 정의 레지스트리. 약관 추가 = 여기에 항목 추가 + 서비스 terms 에 키 등록. */
export const TERM_DEFS: Record<TermKey, TermDef> = {
  tos: {
    key: 'tos',
    label: '서비스 이용약관',
    required: true,
    summary: '서비스 이용에 관한 기본 약관에 동의합니다.',
  },
  privacy: {
    key: 'privacy',
    label: '개인정보 수집 및 이용',
    required: true,
    summary: '회원가입에 필요한 최소한의 개인정보 수집·이용에 동의합니다.',
  },
  age14: {
    key: 'age14',
    label: '만 14세 이상입니다',
    required: true,
    summary: '만 14세 이상임을 확인합니다.',
  },
  marketing: {
    key: 'marketing',
    label: '마케팅 정보 수신 동의',
    required: false,
    summary: '혜택·이벤트 등 마케팅 정보 수신에 동의합니다. (선택)',
  },
};
