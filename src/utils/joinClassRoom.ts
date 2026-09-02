import type { EventRecordStatus } from "@/types/event";

/**
 * Bentuk minimal yang dibutuhkan helper ini. Sengaja tidak mengikat ke
 * EventList/EventDetail karena activeEvent di MainLayout & Home bertipe any
 * dan bisa datang dari kedua endpoint.
 */
type JoinAwareEvent = {
  id?: string | number;
  is_join_class_room?: boolean;
  metadata?: { join_event_ids?: string[] } | null;
} | null | undefined;

/**
 * Id event kembaran di ruang kelas lain — id event ini sendiri dibuang, karena
 * backend ikut menyertakannya di join_event_ids.
 */
export const getTwinEventIds = (event: JoinAwareEvent): string[] => {
  if (!event?.is_join_class_room) return [];

  const ids = event.metadata?.join_event_ids;
  if (!Array.isArray(ids)) return [];

  const selfId = String(event.id ?? "");
  return ids.filter((id) => typeof id === "string" && id !== selfId);
};

export const isJoinClassRoomEvent = (event: JoinAwareEvent): boolean =>
  !!event?.is_join_class_room && getTwinEventIds(event).length > 0;

/**
 * True kalau sesi sedang berjalan tapi dimulai dari podium ruang lain, sehingga
 * podium ini harus jadi pengikut pasif — tampil "sudah mulai" tapi terkunci.
 *
 * Pengecekan is_join_class_room wajib: pada kelas biasa, status server
 * "recording" tanpa penanda lokal justru berarti podium ini baru restart di
 * tengah sesinya sendiri dan HARUS memulihkan akses, bukan mengunci.
 *
 * startedEventId, bukan recordingEventId: yang terakhir dibersihkan saat stop
 * dipanggil termasuk ketika stop-nya gagal, sehingga podium pemilik bisa salah
 * mengunci dirinya sendiri saat jaringan bermasalah.
 */
export const isLockedByTwinRoom = (
  event: JoinAwareEvent,
  serverStatus: EventRecordStatus | null,
  startedEventId: string | null,
): boolean => {
  if (!isJoinClassRoomEvent(event)) return false;
  if (serverStatus !== "recording") return false;

  // Podium ini yang memicu start — dia pemiliknya, bukan pengikut.
  return startedEventId !== String(event?.id ?? "");
};
