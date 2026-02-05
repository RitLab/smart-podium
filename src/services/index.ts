import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const bypassToken = ["/login", "/forgot-password", "/user/login"];

axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let token = localStorage.getItem("token");
  console.log(config.url);
  if (
    token &&
    config.url &&
    !bypassToken.some((item) => config.url?.includes(item))
  ) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !bypassToken.some((item) => originalRequest.url.includes(item))
    ) {
      originalRequest._retry = true;

      try {
        const loginResponse = await axios.post(`${authURL}/login`, {
          app_name: "SLMS",
          email: import.meta.env.VITE_LOGIN_EMAIL,
          password: import.meta.env.VITE_LOGIN_PASSWORD,
        });

        const newToken = loginResponse.data.access_token;

        localStorage.setItem("token", newToken);
        originalRequest.headers.Authorization = `${newToken}`;

        return axios(originalRequest);
      } catch (loginError) {
        localStorage.removeItem("token");
        return Promise.reject(loginError);
      }
    }

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
  },
);

// axios.interceptors.response.use(
//   (res: AxiosResponse) => res,
//   (error: AxiosError) => {
//     const { data, status } = error?.response || {};
//     switch (status) {
//       case 400:
//         console.error("bad request");
//         break;

//       case 401:
//         console.error("unauthorised");
//         break;

//       case 404:
//         console.error("/not-found");
//         break;

//       case 500:
//         console.error("/server-error");
//         break;

//       default:
//         console.error(data || "Something went wrong");
//         break;
//     }
//     return Promise.reject(error);
//   }
// );

export const baseURL = import.meta.env.VITE_API_URL || "";

export const baseSLMSUrl = import.meta.env.VITE_API_SLMS_URL || "";

export const baseWhisperUrl = import.meta.env.VITE_API_WHISPER_URL || "";

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
