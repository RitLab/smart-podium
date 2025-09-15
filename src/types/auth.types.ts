export interface Login {
  email: string;
  password: string;
}

export interface ForgotPassword {
  email: string;
}

export interface Auth {
  token: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  class: string;
  photo: string;
}
