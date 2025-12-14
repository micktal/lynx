// Supabase proxy service - uses server-side proxy to avoid CORS issues
const PROXY_BASE = "/api/supabase";

async function parseResponse(response: Response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (
    response.status === 204 ||
    contentType.indexOf("application/json") === -1
  ) {
    return null;
  }
  return await response.json();
}

export async function supabaseFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  const method = (options.method || "GET").toUpperCase();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
  };

  // Stringify body for non-GET/HEAD methods when body is an object
  if (
    options.body &&
    typeof options.body !== "string" &&
    method !== "GET" &&
    method !== "HEAD"
  ) {
    try {
      fetchOptions.body = JSON.stringify(options.body);
    } catch (err) {
      throw new Error("Failed to serialize request body for Supabase request");
    }
  }

  // Use server proxy with path as query parameter
  const url = `${PROXY_BASE}?path=${encodeURIComponent(path)}`;

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (networkErr: any) {
    const err = new Error(`Network error when contacting Supabase proxy: ${networkErr?.message || String(networkErr)}`);
    (err as any).status = 0;
    throw err;
  }

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        errorMessage = (data && (data.message || data.error || data.description)) || text || errorMessage;
      } catch (e) {
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      // ignore read errors
    }
    const err = new Error(
      `Supabase API error: ${response.status} - ${errorMessage}`,
    );
    (err as any).status = response.status;
    throw err;
  }

  return (await parseResponse(response)) as T | null;
}

// Convenience helpers
export const supabaseGet = <T = any>(
  path: string,
  headers?: Record<string, string>,
) => supabaseFetch<T>(path, { method: "GET", headers });
export const supabasePost = <T = any>(
  path: string,
  body?: any,
  headers?: Record<string, string>,
) => supabaseFetch<T>(path, { method: "POST", body, headers });
export const supabasePatch = <T = any>(
  path: string,
  body?: any,
  headers?: Record<string, string>,
) => supabaseFetch<T>(path, { method: "PATCH", body, headers });
export const supabasePut = <T = any>(
  path: string,
  body?: any,
  headers?: Record<string, string>,
) => supabaseFetch<T>(path, { method: "PUT", body, headers });
export const supabaseDelete = <T = any>(
  path: string,
  headers?: Record<string, string>,
) => supabaseFetch<T>(path, { method: "DELETE", headers });
