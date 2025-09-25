import { Auth, ForgotPassword, Login, User } from "../types/auth.types";
import handler from "./handler";

export const authService = {
  // USE MOCK
  login: async (payload: Login): Promise<Auth> => {
    return await handler.get<Auth>("/login", payload);
  },
  logout: async (): Promise<any> => {
    return await handler.get<any>("/logout");
  },
  forgotPassword: async (params: ForgotPassword): Promise<any> => {
    return await handler.get<any>("/forgot-password", params);
  },
  // login: async (payload: Login): Promise<Auth> => {
  //   return await handler.post<Auth>("/login", payload);
  // },
  // logout: async (): Promise<any> => {
  //   return await handler.post<any>("/logout");
  // },
  // forgotPassword: async (params: ForgotPassword): Promise<any> => {
  //   return await handler.post<any>("/forgot-password", params);
  // },
  getUser: async (): Promise<User> => {
    return await handler.get<User>(`/user`);
  },
};
