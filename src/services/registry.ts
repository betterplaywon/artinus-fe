import type { ServiceConfig, ServiceKind } from './types';

// 서비스 레지스트리 — 회원가입 변형의 단일 진실 공급원. 서비스마다 다른 것(제목·배너·입력 항목·
// 순서·약관·테마)을 전부 데이터로 선언한다. 확장 절차는 README '확장성 설계' / ADR 0003 참조.
export const SERVICES: Record<ServiceKind, ServiceConfig> = {
  community: {
    kind: 'community',
    name: '커뮤니티',
    brandColor: 'violet',
    title: '커뮤니티 시작하기',
    subtitle: '관심사가 같은 사람들과 이야기를 나눠보세요.',
    banner: { alt: '커뮤니티 소개 배너' },
    fields: ['id', 'password', 'passwordConfirm', 'phone'],
    terms: ['tos', 'privacy'],
  },
  news: {
    kind: 'news',
    name: '뉴스 구독',
    brandColor: 'green',
    title: '뉴스 구독 신청',
    subtitle: '매일 아침, 꼭 필요한 소식만 모아 보내드립니다.',
    banner: { alt: '뉴스 구독 소개 배너' },
    fields: ['phone', 'password', 'passwordConfirm'],
    terms: ['tos', 'privacy', 'marketing'],
  },
  shopping: {
    kind: 'shopping',
    name: '쇼핑 멤버십',
    brandColor: 'orange',
    title: '쇼핑 멤버십 가입',
    subtitle: '회원 전용 혜택과 적립을 지금 시작하세요.',
    banner: { alt: '쇼핑 멤버십 소개 배너' },
    fields: ['id', 'password', 'passwordConfirm', 'birthdate', 'phone'],
    terms: ['tos', 'privacy', 'age14', 'marketing'],
  },
};

export function getServiceConfig(kind: ServiceKind): ServiceConfig {
  return SERVICES[kind];
}
