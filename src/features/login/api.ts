import { postJson } from '@/lib';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginUser {
  id: string;
  name: string;
  identifier: string;
}

export interface LoginSuccess {
  token: string;
  user: LoginUser;
}

/** 로그인 요청. (POST /api/login, MSW 로 모킹) */
export function login(request: LoginRequest): Promise<LoginSuccess> {
  return postJson<LoginSuccess>('/api/login', request);
}
