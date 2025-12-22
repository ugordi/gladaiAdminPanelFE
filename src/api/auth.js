// src/api/auth.js
import { http } from "./http";

/**
 * Backend contracts:
 * POST /auth/login   { kullanici_adi, sifre } -> { accessToken, refreshToken }
 * POST /auth/logout  { refreshToken }         -> true | { ok:true }
 * POST /auth/refresh { refreshToken }         -> { accessToken }
 *
 * Admin:
 * POST /admin/audit/logins { event, meta } -> { ok:true, id }
 * GET  /admin/me
 */

export async function loginApi({ username, password }) {
  const { data } = await http.post("/auth/login", {
    kullanici_adi: String(username || "").trim(),
    sifre: String(password || ""),
  });
  return data;
}

export async function logoutApi(refreshToken) {
  const { data } = await http.post("/auth/logout", {
    refreshToken: String(refreshToken || ""),
  });
  return data;
}

export async function refreshApi(refreshToken) {
  const { data } = await http.post("/auth/refresh", {
    refreshToken: String(refreshToken || ""),
  });
  return data;
}

// Admin: login audit
export async function logAdminLoginApi(meta = {}) {
  const { data } = await http.post("/admin/audit/logins", {
    event: "login",
    meta,
  });
  return data;
}

// Admin: me
export async function adminMeApi() {
  const { data } = await http.get("/admin/me");
  return data;
}
