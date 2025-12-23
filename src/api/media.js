// Media.js


import { http, toQuery } from "./http";

/**
 * Media assets
 * GET  /admin/media?kind=image&limit&offset&q
 * POST /admin/media/upload (multipart)
 * POST /admin/media        {url, kind}
 */

export async function listMedia(params = {}) {
  const { data } = await http.get("/admin/media", { params: toQuery(params) });
  return data;
}

export async function createMediaAsset(payload) {
  // { url, kind }
  const { data } = await http.post("/admin/media", payload);
  return data;
}

export async function uploadMedia(file, extra = {}) {
  const form = new FormData();
  form.append("file", file);
  Object.keys(extra).forEach((k) => form.append(k, extra[k]));

  const { data } = await http.post("/admin/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // {id,url,kind}
}
