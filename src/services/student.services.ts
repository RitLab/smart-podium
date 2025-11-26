import { PaginationParams } from "../types/index.types";
import { StudentList, UpdateStatusPayload } from "../types/student.type";
import { baseURL, handler } from ".";

export const studentService = {
  getStudents: async (params: PaginationParams): Promise<StudentList> => {
    console.log(params);
    return await handler.get<StudentList>(`${baseURL}/students`, { params });
  },
  updateStatusStudent: async (payload: UpdateStatusPayload): Promise<any> => {
    return await handler.put(`${baseURL}/change-status-students`, payload);
  },
};
