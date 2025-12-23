// users.js

import { http, toQuery } from "./http";

/**
 * Users Admin
 * GET    /admin/users?status&q&limit&offset
 * GET    /admin/users/:id
 * PATCH  /admin/users/:id/status {status, reason?}
 * PATCH  /admin/users/:id/role   {role}
 * DELETE /admin/users/:id        (opsiyonel soft delete)
 *
 * Extras (istersen):
 * GET /admin/users/:id/main
 * GET /admin/users/:id/wallet
 * GET /admin/users/:id/sessions
 */

export async function listUsers(params = {}) {
  const { data } = await http.get("/admin/users", { params: toQuery(params) });
  return data; // {items,total} beklenir
}

export async function getUser(userId) {
  const { data } = await http.get(`/admin/users/${userId}`);
  return data;
}

export async function updateUserStatus(userId, { status, reason }) {
  const { data } = await http.patch(`/admin/users/${userId}/status`, {
    status,
    reason,
  });
  return data;
}

export async function updateUserRole(userId, { role }) {
  const { data } = await http.patch(`/admin/users/${userId}/role`, { role });
  return data;
}

export async function deleteUser(userId) {
  const { data } = await http.delete(`/admin/users/${userId}`);
  return data;
}

// ---- Optional detail endpoints (backend varsa) ----

export async function getUserMain(userId) {
  const { data } = await http.get(`/admin/users/${userId}/main`);
  return data;
}

export async function getUserWallet(userId) {
  const { data } = await http.get(`/admin/users/${userId}/wallet`);
  return data;
}

export async function getUserSessions(userId) {
  const { data } = await http.get(`/admin/users/${userId}/sessions`);
  return data;
}
