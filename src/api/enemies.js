import { http, toQuery } from "./http";

/**
 * Enemies (pve_enemy_types)
 * GET    /admin/enemies?limit&offset&q&is_boss
 * GET    /admin/enemies/:id
 * POST   /admin/enemies
 * PATCH  /admin/enemies/:id
 * DELETE /admin/enemies/:id
 *
 * Loot/reward quick update (opsiyonel)
 * PATCH  /admin/enemies/:id/rewards  {win_xp_min,max...}
 * PATCH  /admin/enemies/:id/loot     {loot_chance_total, loot_t1..t5}
 */

export async function listEnemies(params = {}) {
  const { data } = await http.get("/admin/enemies", { params: toQuery(params) });
  return data;
}

export async function getEnemy(enemyId) {
  const { data } = await http.get(`/admin/enemies/${enemyId}`);
  return data;
}

export async function createEnemy(payload) {
  // payload örnek: {code,name,base_level, stats..., description, icon_asset_id, is_boss, battle_anim_url}
  const { data } = await http.post("/admin/enemies", payload);
  return data;
}

export async function updateEnemy(enemyId, payload) {
  const { data } = await http.patch(`/admin/enemies/${enemyId}`, payload);
  return data;
}

export async function deleteEnemy(enemyId) {
  const { data } = await http.delete(`/admin/enemies/${enemyId}`);
  return data;
}

// Optional split updates
export async function updateEnemyRewards(enemyId, payload) {
  const { data } = await http.patch(`/admin/enemies/${enemyId}/rewards`, payload);
  return data;
}

export async function updateEnemyLoot(enemyId, payload) {
  const { data } = await http.patch(`/admin/enemies/${enemyId}/loot`, payload);
  return data;
}
