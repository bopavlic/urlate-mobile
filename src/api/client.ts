import { AxiosError, create, type AxiosRequestConfig } from "axios";

import { apiUrl } from "@/lib/config";

type AuthHooks = {
  /** The Better Auth session cookie header value, if signed in. */
  getCookie: () =>
    string | null | undefined | Promise<string | null | undefined>;
  /** Called when the API says the session is gone. */
  onUnauthorized: () => void;
};

let hooks: AuthHooks | null = null;
let lastUnauthorizedAt = 0;
const UNAUTHORIZED_DEBOUNCE_MS = 2_000;

/** The one axios instance every API call goes through (used by the generated client). */
export const api = create({
  baseURL: `${apiUrl}/v1`,
  timeout: 15_000,
  // Native apps send the session cookie explicitly (below), not via a cookie jar.
  withCredentials: false,
});

export function configureApiAuth(next: AuthHooks): void {
  hooks = next;
  lastUnauthorizedAt = 0;
}

api.interceptors.request.use(async (config) => {
  const cookie = await hooks?.getCookie();
  if (cookie) config.headers.set("Cookie", cookie);
  return config;
});

api.interceptors.response.use(undefined, (error: unknown) => {
  if (error instanceof AxiosError && error.response?.status === 401 && hooks) {
    // Several screens may be loading at once; sign out only once for the burst.
    const now = Date.now();
    if (now - lastUnauthorizedAt > UNAUTHORIZED_DEBOUNCE_MS) {
      lastUnauthorizedAt = now;
      hooks.onUnauthorized();
    }
  }
  return Promise.reject(error);
});

/** Orval mutator: performs the request and returns the response body. */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> =>
  api.request<T>({ ...config, ...options }).then((response) => response.data);

export type ErrorType<E> = AxiosError<E>;
export type BodyType<B> = B;

/** The `error.code` from an API error body, e.g. 'USERNAME_TAKEN'. */
export function apiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof AxiosError)) return undefined;
  const body = error.response?.data as
    { error?: { code?: unknown } } | undefined;
  return typeof body?.error?.code === "string" ? body.error.code : undefined;
}
