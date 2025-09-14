import handler from "./handler";
import { User } from "./interface";

export const auth = {
  // MOCK
  login: async (payload: { email: string; password: string }) => {
    let data = { token: "" };
    console.log(payload);
    await fetch("https://dummyjson.com/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "emilys",
        password: "emilyspass",
        expiresInMins: 30, // optional, defaults to 60
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        data = { token: res.accessToken };
      })
      .then(console.log);

    return data;
  },
  logout: async () => {
    setTimeout(() => {
      return {};
    }, 1000);
  },
  // login: (payload: { email: string; password: string }) =>
  //   handler.post<{ token: string }>("/login", payload),
  // logout: () => handler.post("/logout", {}),
  forgotPassword: (payload: { email: string }) =>
    handler.post("/forgot-password", { email: payload.email }),
};

export const users = {
  get: (id: string) => handler.get<User>(`/users/${id}`),
};

export const upload = {
  file: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return handler.formData<{ url: string }>("/upload", formData);
  },
};
