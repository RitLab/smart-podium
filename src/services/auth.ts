// import { authURL, handler } from ".";
import type { Class, ClassListResponse, LoginPayload, LoginResponse, TokenPayload, TokenResponse, User } from "@/types/auth";
import { baseURL, handler } from "./hash";

export const authService = {
  // USE MOCK
  getToken: async (payload: TokenPayload): Promise<TokenResponse> => {
    return await handler.post<TokenResponse>(`${baseURL}/portal/teacher/pin/check`, payload);
  },
  getCLass: async (): Promise<Class[]> => {
    // return await handler.get<Class[]>(`${authURL}/class`);
    return [
      {
        id: "1",
        name: "Pelatihan Penanggulangan Terorisme",
      },
      {
        id: "2",
        name: "Pelatihan Penanggulangan Bencana",
      },
    ];
  },
  getUser: async (): Promise<User> => {
    // return await handler.get<User>(`${authURL}/user`);
    return {
      id: "1",
      name: "Bastian Sinaga",
      email: "test@mail.com",
      username: "bastian",
      class: "Pelatihan Penanggulangan Terorisme",
      photo: "https://i.pravatar.cc/300",
    };
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const url = `${baseURL}/user/login`;
    return await handler.post<LoginResponse>(url, payload);
  },

  getClassList: async (): Promise<ClassListResponse> => {
    const url = `${baseURL}/portal/classroom`
    return await handler.get<any>(url, []);
  }
};
