import { EmptyResponse } from "@/types";
import { baseURL, handler } from "./hash";

import type {
  AttendancePayload,
  AttendanceResponse,
  UpdateAttendance,
} from "@/types/student";

export const studentService = {
  getAttendance: async (
    param: AttendancePayload,
  ): Promise<AttendanceResponse> => {
    const url = `${baseURL}/portal/event/attendance`;
    return await handler.get<AttendanceResponse>(url, param);
  },
  updateAttendance: async (
    payload: UpdateAttendance,
  ): Promise<EmptyResponse> => {
    const url = `${baseURL}/portal/event/attendance`;
    return await handler.put(url, payload);
  },
};