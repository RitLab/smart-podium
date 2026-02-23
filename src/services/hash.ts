// src/services/api.service.ts

import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * Generate HMAC SHA256 (hex)
 * Equivalent to Go implementation:
 * hmac.New(sha256.New, []byte(secret))
 */
const generateHmacSha256 = async (
  path: string,
  secret: string
): Promise<string> => {
  const encoder = new TextEncoder();

  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(path);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

// axios.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     if (config.url) {
//       const secret = import.meta.env.VITE_HASH_SECRET || "";
//       const hash = await generateHmacSha256(config.url, secret);

//       config.headers["X-Api-Key"] = hash;
//     }

//     return config;
//   }
// );

axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.url) {
      const secret = import.meta.env.VITE_HASH_SECRET || "";

      // Ambil hanya pathname tanpa query string
      const urlObject = new URL(
        config.url,
        config.baseURL || window.location.origin
      );

      const pathOnly = urlObject.pathname;

      const hash = await generateHmacSha256(pathOnly, secret);

      config.headers["X-Api-Key"] = hash;
    }

    return config;
  }
);

/**
 * RESPONSE INTERCEPTOR
 */
axios.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;

    switch (status) {
      case 400:
        console.error("bad request");
        break;
      case 404:
        console.error("/not-found");
        break;
      case 500:
        console.error("/server-error");
        break;
      default:
        console.error(error.response?.data || "Something went wrong");
        break;
    }

    return Promise.reject(error);
  }
);

/**
 * BASE URLS
 */
export const baseURL = import.meta.env.VITE_API_URL || "";
export const baseSLMSUrl = import.meta.env.VITE_API_SLMS_URL || "";
export const baseWhisperUrl = import.meta.env.VITE_API_WHISPER_URL || "";
export const authURL = import.meta.env.VITE_API_AUTH_URL || "";

/**
 * RESPONSE HELPER
 */
export const responseBody = <T>(response: AxiosResponse<T>) =>
  response.data;

/**
 * GENERIC HANDLER
 */
export const handler = {
  get: <T>(url: string, params?: {}) => {
    return axios.get<T>(url, { params }).then(responseBody);
  },
  post: <T>(url: string, body?: {}) => {
    return axios.post<T>(url, body).then(responseBody);
  },
  put: <T>(url: string, body?: {}) => {
    return axios.put<T>(url, body).then(responseBody);
  },
  patch: <T>(url: string, body?: {}) => {
    return axios.patch<T>(url, body).then(responseBody);
  },
  delete: <T>(url: string) => {
    return axios.delete<T>(url).then(responseBody);
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

    return axios
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

    return axios
      .put<T>(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(responseBody);
  },
};