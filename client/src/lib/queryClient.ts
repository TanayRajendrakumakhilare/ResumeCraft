import { QueryClient, QueryFunction } from "@tanstack/react-query";

/** Try to extract a useful message from a non-2xx response */
async function buildErrorMessage(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `${res.status} ${res.statusText}`;
  try {
    const json = JSON.parse(raw);
    const msg =
      json?.message ??
      json?.error ??
      (Array.isArray(json?.errors) ? JSON.stringify(json.errors) : json?.errors);
    return `${res.status}: ${msg ?? raw}`;
  } catch {
    return `${res.status}: ${raw}`;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    throw new Error(await buildErrorMessage(res));
  }
}

/**
 * Minimal fetch wrapper used by mutations and custom calls.
 * - Sets JSON headers automatically when `data` is provided
 * - Includes credentials (cookies) for session-based APIs
 * - Throws with parsed server error text on non-2xx
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (data !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Default queryFn for @tanstack/react-query
 * - Accepts a queryKey like ["/api/resumes", id] → GET "/api/resumes/id"
 * - Returns null on 401 if on401="returnNull"
 * - Throws rich errors for other non-2xx statuses
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build a simple URL from the queryKey parts
    // e.g., ["/api/resumes", "123"] => "/api/resumes/123"
    const url = queryKey
      .map((p) => String(p).replace(/(^\/+|\/+$)/g, "")) // trim leading/trailing slashes
      .filter(Boolean)
      .join("/");
    const finalUrl = url.startsWith("/") ? url : `/${url}`;

    const res = await fetch(finalUrl, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
