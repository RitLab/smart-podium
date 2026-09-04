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

/**
 * Kelas gabungan: satu sesi yang berjalan di beberapa ruang kelas sekaligus.
 * Backend memecahnya jadi satu event per ruangan, lalu menautkannya lewat
 * join_event_ids — daftar ini memuat id event kembarannya DAN id event ini sendiri.
 */
export type EventMetadata = {
  join_event_ids?: string[];
};

export type DateClick = {
  year: number;
  month: number;
  day: number;
};

export interface EventList {
  id: string;
  app_name: string;
  // Meeting (is_meeting) tidak punya course_name — namanya ada di title
  title?: string;
  is_meeting?: boolean;
  class_id: string;
  class_name: string;
  class_room_id: string;
  class_room_name: string;
  course_name: string;
  event_date: string;
  // Terverifikasi lewat pengujian API: 0 dari 35 event punya slot_index,
  // 35 dari 35 punya slot_indexes. Field tunggalnya udah dihapus.
  slot_indexes?: number[];
  start_time: string;
  end_time: string;
  teacher_id: string;
  teacher_name: string;
  teacher_image: string;
  color: string;
  course_id: number | string;
  is_join_class_room?: boolean;
  metadata?: EventMetadata | null;
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
  is_join_class_room?: boolean;
  metadata?: EventMetadata | null;
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
