const VALID_API_ORIGINS = new Set([
  "http://13.53.79.153",
  "http://13.53.79.153:3003",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://abance-testing.vercel.app",
  "https://abance-frontend.vercel.app",
  "https://abance-backend-v2.vercel.app",
]);

function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  try {
    const url = new URL(rawUrl.trim());
    if (!VALID_API_ORIGINS.has(url.origin)) {
      console.error(`Invalid API_BASE_URL origin: ${url.origin}`);
      return "";
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`.replace(/\/+$/, "");
  } catch (err) {
    console.error(`Invalid API_BASE_URL value: ${rawUrl}`, err.message);
    return "";
  }
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://13.53.79.153:3003";
export const API_BASE_URL = normalizeApiBaseUrl(rawBaseUrl) || "http://13.53.79.153:3003";

export function buildApiUrl(pathname) {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured correctly");
  }
  const path = String(pathname || "").trim();
  if (!path) {
    throw new Error("API path is required");
  }
  const safePath = path.replace(/^\/+/, "");
  return `${API_BASE_URL}/${safePath}`;
}

export async function safeFetch(resource, init) {
  if (typeof resource === "string") {
    try {
      const url = new URL(resource);
      if (url.protocol === "data:") {
        throw new Error("Invalid fetch URL: data URLs are not supported");
      }
    } catch (err) {
      throw new Error(`Invalid fetch URL: ${String(resource)} — ${err.message}`);
    }
  }
  return fetch(resource, init);
}