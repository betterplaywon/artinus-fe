import type { BrandColor } from '../ui';

/** 서비스 종류(식별 슬러그). HTML 파일명·레지스트리 키로도 그대로 쓰인다. */
export type ServiceKind = 'community' | 'news' | 'shopping';

/** 입력 항목 키. 새 항목 추가 시 여기에 키를 더하고 스키마/컴포넌트 레지스트리에 등록한다. */
export type FieldKey = 'id' | 'password' | 'passwordConfirm' | 'birthdate' | 'phone';

/** 약관 키. */
export type TermKey = 'tos' | 'privacy' | 'age14' | 'marketing';

export interface ServiceBanner {
  alt: string;
  /** 실제 배너 이미지 URL. 미지정 시 브랜드 컬러 그라데이션으로 대체한다. */
  imageSrc?: string;
}

/** 한 서비스의 회원가입 페이지를 기술하는 선언적 설정. (새 서비스 = 이 객체 1항목 + HTML/엔트리) */
export interface ServiceConfig {
  kind: ServiceKind;
  name: string;
  brandColor: BrandColor;
  title: string;
  subtitle: string;
  banner: ServiceBanner;
  /** 렌더링 순서대로의 입력 항목. */
  fields: FieldKey[];
  /** 렌더링 순서대로의 약관. */
  terms: TermKey[];
}
