import { baseURL, handler } from ".";
import type { PaginationParams } from "@/types/index.types";
import type { StudentList, UpdateStatusPayload } from "@/types/student.type";

export const studentService = {
  getStudents: async (params: PaginationParams): Promise<StudentList> => {
    console.log(params);
    return await handler.get<StudentList>(`${baseURL}/students`, { params });
  },
  updateStatusStudent: async (payload: UpdateStatusPayload): Promise<any> => {
    return await handler.put(`${baseURL}/change-status-students`, payload);
  },
};
