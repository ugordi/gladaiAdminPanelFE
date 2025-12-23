// Rankings.js

import { http, toQuery } from "./http";

/**
 * Rankings / Leaderboard
 * GET /admin/rankings?type=season|monthly|all&limit&offset&q
 * Res: {items,total}
 */

export async function listRankings(params = {}) {
  const { data } = await http.get("/admin/rankings", { params: toQuery(params) });
  return data;
}

// opsiyonel: tek kullanıcı rank
export async function getUserRank(userId, params = {}) {
  const { data } = await http.get(`/admin/rankings/users/${userId}`, { params: toQuery(params) });
  return data;
}
