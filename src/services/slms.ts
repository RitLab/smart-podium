// src/service/hardcoded.ts
import axios, { type AxiosResponse } from "axios";

const slmsAxios = axios.create({
  baseURL: import.meta.env.VITE_API_SLMS_URL || "",
  headers: {
    Authorization: import.meta.env.VITE_API_AUTH_CODE || ""
  }
});

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const slmsHandler = {
  get: <T>(url: string, params?: {}) => {
    return slmsAxios.get<T>(url, { params }).then(responseBody);
  },

  post: <T>(url: string, body?: {}) => {
    return slmsAxios.post<T>(url, body).then(responseBody);
  },

  put: <T>(url: string, body?: {}) => {
    return slmsAxios.put<T>(url, body).then(responseBody);
  },

  patch: <T>(url: string, body?: {}) => {
    return slmsAxios.patch<T>(url, body).then(responseBody);
  },

  delete: <T>(url: string) => {
    return slmsAxios.delete<T>(url).then(responseBody);
  },

  postFormData: <T>(url: string, body: Record<string, any>) => {
    const data = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        data.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, v));
      } else if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });

    return slmsAxios
      .post<T>(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(responseBody);
  },

  putFormData: <T>(url: string, body: Record<string, any>) => {
    const data = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        data.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, v));
      } else if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });

    return slmsAxios
      .put<T>(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(responseBody);
  },
};
