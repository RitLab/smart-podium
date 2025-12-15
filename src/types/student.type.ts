import type { Pagination } from "./index.types";
import type { VariantType } from "./ui.types";

export type Status = "present" | "absent" | "loa" | "";

export type HandlingStatus = {
  status: Status;
  label: string;
  variant: VariantType;
};
export interface Student {
  id: 1;
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
