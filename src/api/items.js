import { http, toQuery } from "./http";

/**
 * Item Templates
 * GET    /admin/item-templates?limit&offset&q&category&rarity&tier
 * GET    /admin/item-templates/:id
 * POST   /admin/item-templates
 * PATCH  /admin/item-templates/:id
 * DELETE /admin/item-templates/:id
 *
 * Equipment slots (read)
 * GET /admin/equipment-slots
 */

export async function listItemTemplates(params = {}) {
  const { data } = await http.get("/admin/item-templates", { params: toQuery(params) });
  return data;
}

export async function getItemTemplate(id) {
  const { data } = await http.get(`/admin/item-templates/${id}`);
  return data;
}

export async function createItemTemplate(payload) {
  const { data } = await http.post("/admin/item-templates", payload);
  return data;
}

export async function updateItemTemplate(id, payload) {
  const { data } = await http.patch(`/admin/item-templates/${id}`, payload);
  return data;
}

export async function deleteItemTemplate(id) {
  const { data } = await http.delete(`/admin/item-templates/${id}`);
  return data;
}

export async function listEquipmentSlots() {
  const { data } = await http.get("/admin/equipment-slots");
  return data;
}
