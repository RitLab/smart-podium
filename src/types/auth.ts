import { BaseResponse } from ".";

export interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  pin: string;
  class_id: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  class: string;
  photo: string;
}

export interface Auth {
  app_name: string;
  access_token: string;
  refresh_token: string;
}

export interface LoginPayload {
  app_name: string;
  email: string;
  password: string;
}

export interface LoginResponse extends BaseResponse {
  data: Auth;
}
