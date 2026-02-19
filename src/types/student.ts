import type { BaseResponse } from ".";
import { VariantType } from "./ui";

export type HandlingStatus = {
  value: number;
  label: string;
  variant: VariantType;
};

export interface AttendancePayload {
  event_id: string;
}

export interface Attendance {
  user_id: string;
  student_unique_id: string;
  student_name: string;
  student_image_profile: string;
  attendance_status: number;
}

export interface Event {
  id: string;
  title: string;
  class_id: string;
  class_name: string;
  class_room_id: string;
  class_room_name: string;
  course_name: string;
  event_date: string;
  weekday: number;
  slot_indexes: number[];
  start_time: string;
  end_time: string;
  teacher_id: string;
  teacher_name: string;
  teacher_image: string;
  color: string;
  status: string;
  metadata: any;
  attendances: Attendance[];
}

export interface AttendanceResponse extends BaseResponse {
  data: Event;
}

export interface UpdateAttendance {
  event_id: string;
  user_id: string;
  status: number;
}
