// 최소 fetch 래퍼: JSON 파싱 + 비정상 응답 throw + 타임아웃. (기술 선택 근거는 README '비동기·오류 처리')
// 실패를 예외로 통일해 react-query 의 isError/오류 흐름과 자연스럽게 맞춘다.
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
  const { timeoutMs = 10_000, headers, ...rest } = options;
  // 무한 대기를 막는 타임아웃. (AbortController 로 fetch 를 끊는다)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
