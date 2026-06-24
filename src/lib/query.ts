import { QueryClient } from '@tanstack/react-query';

/**
 * 공용 QueryClient 팩토리.
 * 현재 react-query 사용처는 휴대폰 인증 useMutation 하나뿐이라(조회 useQuery 없음) 전역 기본값은 두지 않는다.
 * 인증의 retry:false 는 "사용자 의도로만 재시도"라는 도메인 규칙이라 usePhoneVerification 호출부에 둔다.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient();
}
