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

export interface Classes {
  id: string;
  name: string;
  hcp_id: number;
  hcp_class_type: number;
  hcp_class_area_id: number;
  total_student: number;
}

export interface Pagination {
  current_page: number;
  next_page: null;
  per_page: number;
  prev_page: null;
  total_pages: number;
  total_records: number;
}

export interface ClassData {
  classes: Classes[];
  pagination: Pagination;
}

export interface ClassListResponse extends BaseResponse {
  data: ClassData;
}
