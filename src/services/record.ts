import { slmsHandler } from "./slms";

export type StartRecordPayload = {
  module_id?: number;
  title?: string;
};

export type StopRecordPayload = {
  record_id: number;
  duration: number; // dalam detik
};

export const recordApi = {
  /**
   * Start recording session
   */
  start: (body: StartRecordPayload) =>
    slmsHandler.post<{
      success: boolean;
      data: {
        record_id: number;
        started_at: string;
      };
    }>("/portal/recording/start", body),

  /**
   * Stop recording session
   */
  stop: (body: StopRecordPayload) =>
    slmsHandler.post<{
      success: boolean;
      data: {
        record_id: number;
        duration: number;
      };
    }>("/portal/recording/stop", body),

  /**
   * Optional: heartbeat / keep-alive
   * supaya backend tahu recording masih jalan
   */
  heartbeat: (record_id: number) =>
    slmsHandler.post<{
      success: boolean;
    }>("/portal/recording/heartbeat", { record_id }),
};
