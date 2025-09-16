import { Pagination } from "./index.types";

export interface Student {
  id: 1;
  name: string;
  image: string;
  status: "present" | "absent" | "loa";
}

export interface StudentList {
  total_present: number;
  total_absent: number;
  total_loa: number;
  students: Student[];
  pagination: Pagination;
}
