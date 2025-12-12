// Supabase REST API configuration and small fetch wrapper
export const SUPABASE_URL = 'https://juyownedgwfbigbwofxx.supabase.com';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eW93bmVkZ3dmYmlnYndvZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzM4MTgsImV4cCI6MjA4MTEwOTgxOH0.4LOp1KHJH2pY6SHXjvRVLcicbENe5-EUH16yIxGD-HI';

const defaultHeaders = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Prefer: 'return=representation',
};

async function parseResponse(response: Response) {
  const contentType = response.headers.get('Content-Type') || '';
  if (response.status === 204 || contentType.indexOf('application/json') === -1) {
    // No content or non-JSON response
    return null;
  }
  return await response.json();
}

export async function supabaseFetch<T = any>(path: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;

  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  } as Record<string, string>;

  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    // include credentials (cookies) for cross-site requests when needed
    credentials: 'include',
  };

  // Only stringfy body for non-GET/HEAD methods when body is an object
  if (options.body && typeof options.body !== 'string' && method !== 'GET' && method !== 'HEAD') {
    try {
      fetchOptions.body = JSON.stringify(options.body);
    } catch (err) {
      throw new Error('Failed to serialize request body for Supabase request');
    }
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const data = await response.json();
      // Supabase REST errors often come in { message: '...' } or description
      errorMessage = (data && (data.message || data.error || data.description)) || errorMessage;
    } catch (e) {
      // ignore JSON parse errors
    }
    const err = new Error(`Supabase API error: ${response.status} - ${errorMessage}`);
    (err as any).status = response.status;
    throw err;
  }

  return (await parseResponse(response)) as T | null;
}

// Convenience helpers
export const supabaseGet = <T = any>(path: string, headers?: Record<string, string>) => supabaseFetch<T>(path, { method: 'GET', headers });
export const supabasePost = <T = any>(path: string, body?: any, headers?: Record<string, string>) => supabaseFetch<T>(path, { method: 'POST', body, headers });
export const supabasePatch = <T = any>(path: string, body?: any, headers?: Record<string, string>) => supabaseFetch<T>(path, { method: 'PATCH', body, headers });
export const supabasePut = <T = any>(path: string, body?: any, headers?: Record<string, string>) => supabaseFetch<T>(path, { method: 'PUT', body, headers });
export const supabaseDelete = <T = any>(path: string, headers?: Record<string, string>) => supabaseFetch<T>(path, { method: 'DELETE', headers });

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  headers: defaultHeaders,
};
