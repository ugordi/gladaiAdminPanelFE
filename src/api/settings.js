// src/api/settings.js
import { http } from "./http";

/**
 * Settings
 * GET   /admin/settings
 * PATCH /admin/settings/admin   {points_per_level}
 * PATCH /admin/settings/energy  {battle_cost}
 * PATCH /admin/settings/pvp     {steal_pct_min, steal_pct_max}
 *
 * Battle rewards (full replace)
 * PUT   /admin/battle-rewards   body: array OR {items: array}
 *
 * XP rules
 * GET   /admin/xp-rules
 */

export async function getSettings() {
  const { data } = await http.get("/admin/settings");
  return data;
}

export async function updateAdminSettings(payload) {
  const { data } = await http.patch("/admin/settings/admin", payload);
  return data;
}

export async function updateEnergySettings(payload) {
  const { data } = await http.patch("/admin/settings/energy", payload);
  return data;
}

export async function updatePvpSettings(payload) {
  const { data } = await http.patch("/admin/settings/pvp", payload);
  return data;
}

export async function replaceBattleRewards(items) {
  // backend: req.body array veya {items}
  const body = Array.isArray(items) ? items : { items };
  const { data } = await http.put("/admin/battle-rewards", body);
  return data; // {ok:true, items:[...]}
}

export async function getXpRules() {
  const { data } = await http.get("/admin/xp-rules");
  return data;
}
