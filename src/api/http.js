// http.js
 

import axios from "axios";
import { getToken, clearToken } from "../auth/token";

/**
 * Elite admin panel HTTP client
 * - Bearer token ekler
 * - 401'de token temizler
 * - API hata mesajını normalize eder
 */

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Token invalid / expired
    const status = err?.response?.status;
    if (status === 401) {
      clearToken();
    }
    return Promise.reject(normalizeApiError(err));
  }
);

export function toQuery(params = {}) {
  // undefined/null/"" temizle
  const cleaned = {};
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    cleaned[k] = v;
  });
  return cleaned;
}

export function normalizeApiError(err) {
  // Axios error -> uniform shape
  const status = err?.response?.status || 0;
  const data = err?.response?.data;

  const message =
    data?.message ||
    data?.error ||
    err?.message ||
    "Beklenmeyen bir hata oluştu.";

  return {
    isApiError: true,
    status,
    message,
    data,
    raw: err,
  };
}
