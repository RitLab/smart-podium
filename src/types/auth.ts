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
