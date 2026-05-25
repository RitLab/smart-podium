import { BaseResponse } from ".";

export type EventItem = {
  id: string;
  name: string;
  type: string;
  times?: {
    start: string;
    end: string;
  };
};

export type EventGroup = {
  date: string;
  day: string;
  items: EventItem[];
};

export type DateClick = {
  year: number;
  month: number;
  day: number;
};

export interface EventList {
  id: string;
  class_id: string;
  class_name: string;
  class_room_id: string;
  class_room_name: string;
  course_name: string;
  event_date: string;
  slot_index: number;
  start_time: string;
  end_time: string;
  teacher_id: string;
  teacher_name: string;
  teacher_image: string;
  color: string;
  course_id: number | string;
  metadata?: string | null;
}

export type EventRecordStatus =
  | ""
  | "recording"
  | "failed"
  | "stopped"
  | "reupload_failed"
  | "reupload_success";

export interface EventDetail {
  id: string;
  title: string;
  class_id: string;
  class_name: string;
  class_room_id: string;
  class_room_name: string;
  course_id: number | string;
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
  status: EventRecordStatus;
  is_meeting: boolean;
  metadata: string | null;
}

export interface EventDetailResponse extends BaseResponse {
  data: EventDetail;
}

export interface EventListPayload {
  month: number;
  year: number;
}

export interface EventListByDatePayload extends EventListPayload {
  day: number;
}

export interface EventListResponse extends BaseResponse {
  data: {
    events: EventList[]
  }
}
