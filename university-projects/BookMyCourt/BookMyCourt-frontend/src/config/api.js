/** Backend base URL, no trailing slash (e.g. https://api.example.com/v1). */
export function getApiBase() {
  const u = import.meta.env.VITE_API_URL;
  if (u == null || String(u).trim() === "") return "";
  return String(u).replace(/\/$/, "");
}
