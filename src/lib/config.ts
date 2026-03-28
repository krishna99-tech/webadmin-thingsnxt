/** Public API base URL (FastAPI gateway). No trailing slash. */
export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://192.168.29.139:8000";
