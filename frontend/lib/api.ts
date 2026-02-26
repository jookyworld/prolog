const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<Response> | null = null;

async function refreshAccessToken(): Promise<Response> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new ApiError(401, "토큰 갱신에 실패했습니다.");
  }

  return res;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (
    res.status === 401 &&
    !path.includes("/auth/refresh") &&
    !path.includes("/auth/login")
  ) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      await refreshPromise;
      refreshPromise = null;

      // Retry original request (new cookie is set by refresh)
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        ...options,
        headers,
      });

      if (!retryRes.ok) {
        throw new ApiError(
          retryRes.status,
          `API 요청 실패 (${retryRes.status})`,
        );
      }

      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    } catch {
      refreshPromise = null;
      throw new ApiError(401, "인증이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, `API 요청 실패 (${res.status})`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
