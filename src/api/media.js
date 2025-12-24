// src/api/Media.js
import { http, toQuery } from "./http";

export async function listMedia(params = {}) {
  const { data } = await http.get("/admin/media", { params: toQuery(params) });
  return data; // { items, total }
}

export async function createMediaAsset(payload) {
  const { data } = await http.post("/admin/media", payload);
  return data; // asset row
}

export async function uploadMedia(file, extra = {}) {
  const form = new FormData();
  form.append("file", file);
  Object.keys(extra).forEach((k) => {
    if (extra[k] !== undefined && extra[k] !== null) form.append(k, String(extra[k]));
  });

  const { data } = await http.post("/admin/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // ✅ her iki formata da dayanıklı yap:
  return data?.asset || data;
}
