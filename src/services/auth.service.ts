import { Class, TokenPayload, TokenResponse, User } from "../types/auth.types";
import { authURL, handler } from ".";

export const authService = {
  // USE MOCK
  getToken: async (payload: TokenPayload): Promise<TokenResponse> => {
    return await handler.get<TokenResponse>(`${authURL}/get-token`, payload);
  },
  getCLass: async (): Promise<Class[]> => {
    return await handler.get<Class[]>(`${authURL}/class`);
  },
  getUser: async (): Promise<User> => {
    return await handler.get<User>(`${authURL}/user`);
  },
};
