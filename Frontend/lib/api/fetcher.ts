export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface FetchOptions extends RequestInit {
  data?: any;
  requireAuth?: boolean;
}

export async function fetcher<T>(
  endpoint: string,
  { data, requireAuth = true, headers: customHeaders, ...customConfig }: FetchOptions = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (requireAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    body: data ? JSON.stringify(data) : undefined,
    headers,
    ...customConfig,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (isJson) {
      return response.json();
    }
    return response.text() as unknown as T;
  }

  // Handle errors
  const errorMessage = await response.text();
  throw new Error(errorMessage || response.statusText);
}
