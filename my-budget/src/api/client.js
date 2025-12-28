const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function api(
  path,
  { method = "GET", body, token, headers: customHeaders } = {}
) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;

  return JSON.parse(text);
}

export { api };
export default api;
