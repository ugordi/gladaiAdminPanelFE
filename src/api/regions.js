import { http, toQuery } from "./http";

/**
 * Regions
 * GET    /admin/regions?limit&offset&q
 * GET    /admin/regions/:id
 * POST   /admin/regions
 * PATCH  /admin/regions/:id
 * DELETE /admin/regions/:id
 *
 * Region Enemy defs
 * GET    /admin/regions/:id/enemies
 * POST   /admin/regions/:id/enemies     {enemy_type_id,min_level,max_level,weight}
 * PATCH  /admin/region-enemy-defs/:id   {min_level,max_level,weight}
 * DELETE /admin/region-enemy-defs/:id
 */

export async function listRegions(params = {}) {
  const { data } = await http.get("/admin/regions", { params: toQuery(params) });
  return data;
}

export async function getRegion(regionId) {
  const { data } = await http.get(`/admin/regions/${regionId}`);
  return data;
}

export async function createRegion(payload) {
  // payload örnek: {name,min_level,short_description, story?, icon_asset_id?}
  const { data } = await http.post("/admin/regions", payload);
  return data;
}

export async function updateRegion(regionId, payload) {
  const { data } = await http.patch(`/admin/regions/${regionId}`, payload);
  return data;
}

export async function deleteRegion(regionId) {
  const { data } = await http.delete(`/admin/regions/${regionId}`);
  return data;
}

// --- Region Enemy defs ---

export async function listRegionEnemies(regionId) {
  const { data } = await http.get(`/admin/regions/${regionId}/enemies`);
  return data;
}

export async function addEnemyToRegion(regionId, payload) {
  // { enemy_type_id, min_level, max_level, weight }
  const { data } = await http.post(`/admin/regions/${regionId}/enemies`, payload);
  return data;
}

export async function updateRegionEnemyDef(defId, payload) {
  const { data } = await http.patch(`/admin/region-enemy-defs/${defId}`, payload);
  return data;
}

export async function removeEnemyFromRegion(defId) {
  const { data } = await http.delete(`/admin/region-enemy-defs/${defId}`);
  return data;
}
