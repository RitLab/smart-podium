// src/service/hardcoded.ts
import axios, { type AxiosResponse } from "axios";

const slmsAxios = axios.create({
  baseURL: import.meta.env.VITE_API_SLMS_URL || "",
  timeout: 15000, // Tambah timeout biar nggak nunggu selamanya
  headers: {
    Authorization: import.meta.env.VITE_API_AUTH_CODE || "",
  },
});

// Helper buat nerjemahin error backend jadi bahasa manusia
const getHumanMessage = (error: any) => {
  if (!error.response) {
    if (error.code === "ECONNABORTED") return "Koneksi terputus (Timeout). Silakan cek internet Anda.";
    return "Gagal terhubung ke server. Pastikan Anda online.";
  }

  const status = error.response.status;
  const data = error.response.data;
  const backendMessage = data?.message?.toLowerCase() || "";

  // Mapping error alien jadi manusiawi
  if (backendMessage.includes("unexpected error")) {
    return "Sistem sedang mengalami kendala teknis. Silakan coba beberapa saat lagi.";
  }
  if (backendMessage.includes("invalid format")) {
    return "Data yang dikirimkan tidak sesuai format. Silakan hubungi admin.";
  }
  if (backendMessage.includes("required")) {
    return "Ada informasi wajib yang belum terisi atau tidak terbaca oleh sistem.";
  }

  // Mapping berdasarkan status code
  switch (status) {
    case 401: return "Sesi Anda telah berakhir. Silakan masuk kembali.";
    case 403: return "Anda tidak memiliki akses untuk melakukan aksi ini.";
    case 404: return "Data yang Anda cari tidak ditemukan di server.";
    case 500: return "Server sedang mengalami gangguan (Internal Error).";
    case 502: case 503: return "Layanan sedang tidak tersedia. Server mungkin sedang maintenance.";
    default: return data?.message || "Terjadi kesalahan sistem. Silakan coba lagi.";
  }
};

slmsAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getHumanMessage(error);
    // Kita bungkus lagi biar catch di UI nerima string pesan yang enak dibaca
    return Promise.reject(message);
  }
);

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
