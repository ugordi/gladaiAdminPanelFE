import { http } from "./http";

/**
 * Settings bundle
 * GET   /admin/settings
 * PATCH /admin/settings/admin    {points_per_level}
 * PATCH /admin/settings/energy   {battle_cost, regen_seconds?, ...}
 * PATCH /admin/settings/pvp      {steal_pct_min, steal_pct_max}
 * PUT   /admin/battle-rewards    {items:[...]}  veya direkt array
 *
 * XP rules display:
 * GET /admin/xp-rules (opsiyonel) -> {type:"fn_xp_needed", samples:[...]}
 */

export async function getSettings() {
  const { data } = await http.get("/admin/settings");
  return data;
}

export async function updateAdminSettings(payload) {
  // { points_per_level }
  const { data } = await http.patch("/admin/settings/admin", payload);
  return data;
}

export async function updateEnergySettings(payload) {
  // { battle_cost, regen_seconds, ... }
  const { data } = await http.patch("/admin/settings/energy", payload);
  return data;
}

export async function updatePvpSettings(payload) {
  // { steal_pct_min, steal_pct_max }
  const { data } = await http.patch("/admin/settings/pvp", payload);
  return data;
}

export async function replaceBattleRewards(payload) {
  // payload: { items: [...] } veya direkt [...]
  const body = Array.isArray(payload) ? { items: payload } : payload;
  const { data } = await http.put("/admin/battle-rewards", body);
  return data;
}

export async function getXpRules() {
  const { data } = await http.get("/admin/xp-rules");
  return data;
}
