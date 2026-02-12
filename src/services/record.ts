import { baseWhisperUrl, handler } from ".";

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
   * Optional: heartbeat / keep-alive
   * supaya backend tahu recording masih jalan
   */
  heartbeat: (record_id: number) =>
    handler.post<{
      success: boolean;
    }>("/portal/recording/heartbeat", { record_id }),
};
