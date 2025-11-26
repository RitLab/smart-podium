import { Auth, ForgotPassword, Login, User } from "../types/auth.types";
import { authURL, handler } from ".";

export const authService = {
  // USE MOCK
  login: async (payload: Login): Promise<Auth> => {
    return await handler.get<Auth>(`${authURL}/login`, payload);
  },
  logout: async (): Promise<any> => {
    return await handler.get<any>(`${authURL}/logout`);
  },
  forgotPassword: async (params: ForgotPassword): Promise<any> => {
    return await handler.get<any>(`${authURL}/forgot-password`, params);
  },
  // login: async (payload: Login): Promise<Auth> => {
  //   return await handler.post<Auth>(`${authURL}/login`, payload);
  // },
  // logout: async (): Promise<any> => {
  //   return await handler.post<any>(`${authURL}/logout`);
  // },
  // forgotPassword: async (params: ForgotPassword): Promise<any> => {
  //   return await handler.post<any>(`${authURL}/forgot-password`, params);
  // },
  getUser: async (): Promise<User> => {
    return await handler.get<User>(`${authURL}/user`);
  },
};
