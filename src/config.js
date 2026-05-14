const rawBaseUrl = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = String(rawBaseUrl || "").trim().replace(/\/+$/, "");

export function buildApiUrl(pathname) {
  const path = String(pathname || "").trim();
  if (!path) {
    throw new Error("API path is required");
  }
  const safePath = path.replace(/^\/+/, "");
  return API_BASE_URL ? `${API_BASE_URL}/${safePath}` : `/${safePath}`;
}

export async function safeFetch(resource, init) {
  const response = await fetch(resource, init);
  if (!response.ok) {
    let errorMessage = "";
    try {
      const data = await response.json();
      if (data && data.message) {
        errorMessage = `: ${data.message}`;
      } else {
        errorMessage = `: ${JSON.stringify(data)}`;
      }
    } catch {
      const text = await response.text();
      errorMessage = text ? `: ${text}` : "";
    }
    throw new Error(`Request failed ${response.status} ${response.statusText}${errorMessage}`);
  }
  return response;
}
