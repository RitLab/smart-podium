import { baseWhisperUrl, handler } from "./hash";

export type StartRecordPayload = {
  module_id?: number;
  title?: string;
};

export type StopRecordPayload = {
  session_id: string;
  event_id: string;
};

export const recordApi = {
  /**
   * Start recording session
   */
  start: (id: string) =>
    handler.post<{
      message: string;
      data: {
        session_id: string;
      };
      status: number;
    }>(`${baseWhisperUrl}/portal/video/${id}/start`),

  /**
   * Stop recording session
   */
  stop: (body: StopRecordPayload) =>
    handler.post<{
      message: string;
      data: {};
      status: number;
    }>(`${baseWhisperUrl}/portal/video/stop`, body),

  /**
   * Check teacher PIN
   */
  checkPin: (body: { teacher_id: string; pin: string }) => {
    return handler.post<{
      message: string;
      data: any;
      status: number;
    }>(`${baseWhisperUrl}/portal/teacher/pin/check`, body);
  },
};
