import { StudentList, UpdateStatusPayload } from "../types/student.type";
import handler from "./handler";

export const studentService = {
  getStudents: async (): Promise<StudentList> => {
    const data = await handler.get<StudentList>("/students");
    return data;
  },
  updateStatusStudent: async (payload: UpdateStatusPayload): Promise<any> => {
    await handler.put("/change-status-students", payload);
  },
};
