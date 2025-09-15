export type Login = {
  email: string;
  password: string;
};

export type ForgotPassword = {
  email: string;
};

export type Auth = {
  token: string;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  class: string;
  photo: string;
};
