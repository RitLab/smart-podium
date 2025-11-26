import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const bypassToken = ["/login", "/forgot-password"];

axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let token = localStorage.getItem("token");
  if (token && !bypassToken.some((item) => config.url?.includes(item))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    const { data, status } = error?.response || {};
    switch (status) {
      case 400:
        console.error("bad request");
        break;

      case 401:
        console.error("unauthorised");
        break;

      case 404:
        console.error("/not-found");
        break;

      case 500:
        console.error("/server-error");
        break;

      default:
        console.error(data || "Something went wrong");
        break;
    }
    return Promise.reject(error);
  }
);

export const baseURL = import.meta.env.VITE_API_URL || "";
export const authURL = import.meta.env.VITE_API_AUTH_URL || "";

export const responseBody = <T>(response: AxiosResponse<T>) => response.data;

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
