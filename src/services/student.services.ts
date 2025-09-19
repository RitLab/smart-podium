import { PaginationParams } from "../types/index.types";
import { StudentList, UpdateStatusPayload } from "../types/student.type";
import handler from "./handler";

export const studentService = {
  getStudents: async (params: PaginationParams): Promise<StudentList> => {
    console.log(params);
    return await handler.get<StudentList>("/students", { params });
  },
  updateStatusStudent: async (payload: UpdateStatusPayload): Promise<any> => {
    return await handler.put("/change-status-students", payload);
  },
};
