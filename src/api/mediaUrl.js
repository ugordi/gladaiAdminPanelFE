// src/api/mediaUrl.js
import { baseURL} from "./http"; // sende yoksa aşağıda anlatacağım

export function resolveMediaUrl(url) {
  if (!url) return "";
  // absolute ise dokunma
  if (/^https?:\/\//i.test(url)) return url;

  // relative (/uploads/..)
  // API_BASE_URL: http://localhost:3000/api/v1 gibi ise
  // uploads base: http://localhost:3000
  const api = String(baseURL || "").replace(/\/+$/, "");
  const origin = api.replace(/\/api\/v1$/i, ""); // /api/v1 mount’unu sil
  return origin + url;
}
