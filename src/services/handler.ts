import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const bypassToken = ["/login", "/forgot-password"];

axios.defaults.baseURL = "http://localhost:3000";

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
    const { data, status } = error.response!;
    switch (status) {
      case 400:
        console.error(data);
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
    }
    return Promise.reject(error);
  }
);

export const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export default {
  get: <T>(url: string, params?: {}) =>
    axios.get<T>(url, { params }).then(responseBody),
  post: <T>(url: string, body?: {}) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body?: {}) =>
    axios.put<T>(url, body).then(responseBody),
  patch: <T>(url: string, body?: {}) =>
    axios.patch<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
  formData: <T>(url: string, data: FormData) =>
    axios
      .post<T>(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(responseBody),
};
