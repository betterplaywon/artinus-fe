/**
 * 최소한의 타입 안전 fetch 래퍼.
 *
 * 설계 의도:
 * - axios 등 추가 의존성 없이 표준 `fetch`만으로 (1) JSON 파싱, (2) 비정상 응답의 에러화,
 *   (3) 타임아웃(AbortController) 세 가지 공통 관심사를 캡슐화한다.
 * - 실패를 "예외(throw)"로 통일해 react-query 의 isError/에러 바운더리 흐름과 자연스럽게 맞춘다.
 *   → 호출부는 성공 경로만 다루고, 오류 UI/재시도는 query 레이어가 담당한다.
 * - 트레이드오프: 인터셉터/요청 큐 같은 고급 기능은 없다. 과제 범위에선 단순함이 더 큰 이득.
 */
export class HttpError<TBody = unknown> extends Error {
  readonly status: number;
  readonly body: TBody;

  constructor(status: number, statusText: string, body: TBody) {
    super(`HTTP ${status} ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export interface HttpOptions extends RequestInit {
  /** 요청 타임아웃(ms). 기본 10초. */
  timeoutMs?: number;
}

export async function httpJson<T>(url: string, options: HttpOptions = {}): Promise<T> {
  const { timeoutMs = 10_000, headers, signal, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // 호출부 signal 과 타임아웃 signal 을 함께 존중한다.
  // - 이미 abort 된 signal 은 'abort' 이벤트가 재발화하지 않으므로 즉시 반영한다.
  // - 정상 종료 시 리스너가 (공유·장수 signal 에) 잔류하지 않도록 finally 에서 정리한다.
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...headers },
    });
    const body = await parseBody(res);
    if (!res.ok) throw new HttpError(res.status, res.statusText, body);
    return body as T;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

/** POST + JSON 본문 전송 헬퍼. */
export function postJson<T>(url: string, payload: unknown, options: HttpOptions = {}): Promise<T> {
  return httpJson<T>(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(payload),
  });
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
