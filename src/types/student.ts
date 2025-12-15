import type { Pagination } from ".";
import type { VariantType } from "./ui";

export type Status = "present" | "absent" | "loa" | "";

export type HandlingStatus = {
  status: Status;
  label: string;
  variant: VariantType;
};
export interface Student {
  id: number;
  name: string;
  image: string;
  status: Status;
}

export interface StudentList {
  total_present: number;
  total_absent: number;
  total_loa: number;
  students: Student[];
  pagination: Pagination;
}

export interface UpdateStatusPayload {
  id: number;
  status: Status;
}
