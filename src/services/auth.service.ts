import { Auth, ForgotPassword, Login, User } from "../types/auth.types";
import handler from "./handler";

export const authService = {
  login: async (payload: Login): Promise<Auth> => {
    const data = await handler.get<Auth>("/login");
    return data;
  },
  logout: async (): Promise<any> => {
    const data = await handler.get<any>("/logout");
    return data;
  },
  //   login: async (payload: Login): Promise<Auth> => {
  //     const data = await handler.post<Auth>("/login", payload);
  //     return data;
  //   },
  //   logout: async (): Promise<any> => {
  //     const data = await handler.post<any>("/logout");
  //     return data;
  //   },
  forgotPassword: async (payload: ForgotPassword): Promise<any> => {
    const data = await handler.post<any>("/forgot-password", payload);
    return data;
  },
  getUser: async (): Promise<User> => {
    const data = await handler.get<User>(`/user`);
    return data;
  },
};
