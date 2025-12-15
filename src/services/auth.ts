// import { authURL, handler } from ".";
import type { Class, TokenPayload, TokenResponse, User } from "@/types/auth";

export const authService = {
  // USE MOCK
  getToken: async (_: TokenPayload): Promise<TokenResponse> => {
    // return await handler.get<TokenResponse>(`${authURL}/get-token`, payload);
    return {
      token: "123134123123",
    };
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
};
