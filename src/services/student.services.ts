import { ParticipantList } from "../types/student.type";
import handler from "./handler";

export const studentService = {
  getParticipantList: async (): Promise<ParticipantList> => {
    const data = await handler.get<ParticipantList>("/participant");
    return data;
  },
};
