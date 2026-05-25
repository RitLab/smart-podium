// src/stores/record.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { recordApi } from "@/services/record";

/* =====================================================
   TYPES
===================================================== */

export type RecordState = {
  isRecording: boolean;
  session_id: string | null;
  recordingEventId: string | null;
  recordingEventEndTime: string | null;
  recordingEventEndAt: number | null;
  startTime: number | null; // timestamp (ms)
  duration: number; // dalam detik
  loading: boolean;
  error: string | null;
  /** true setelah stopRecord berhasil, reset saat event baru/start baru */
  hasStoppedSession: boolean;
  stoppedAt: number | null; // timestamp (ms)
  showSummary: boolean;
  showStopConfirm: boolean;
  finishedEvent: any | null;
};

/* =====================================================
   INITIAL STATE
===================================================== */

const RECOVERY_KEY = "smart_podium_recording_state";

const loadPersistedState = (): Partial<RecordState> => {
  try {
    const serializedState = localStorage.getItem(RECOVERY_KEY);
    if (!serializedState) return {};
    return JSON.parse(serializedState);
  } catch (err) {
    return {};
  }
};

const savePersistedState = (state: RecordState) => {
  try {
    const {
      isRecording,
      session_id,
      recordingEventId,
      recordingEventEndTime,
      recordingEventEndAt,
      startTime,
      hasStoppedSession,
      stoppedAt,
    } = state;
    localStorage.setItem(
      RECOVERY_KEY,
      JSON.stringify({
        isRecording,
        session_id,
        recordingEventId,
        recordingEventEndTime,
        recordingEventEndAt,
        startTime,
        hasStoppedSession,
        stoppedAt,
      })
    );
  } catch (err) {
    // ignore
  }
};

const persisted = loadPersistedState();

const initialState: RecordState = {
  isRecording: persisted.isRecording ?? false,
  session_id: persisted.session_id ?? null,
  recordingEventId: persisted.recordingEventId ?? null,
  recordingEventEndTime: persisted.recordingEventEndTime ?? null,
  recordingEventEndAt: persisted.recordingEventEndAt ?? null,
  startTime: persisted.startTime ?? null,
  duration: persisted.startTime
    ? Math.floor((Date.now() - persisted.startTime) / 1000)
    : 0,
  loading: false,
  error: null,
  hasStoppedSession: persisted.hasStoppedSession ?? false,
  stoppedAt: persisted.stoppedAt ?? null,
  showSummary: false,
  showStopConfirm: false,
  finishedEvent: null,
};

/* =====================================================
   START RECORD
===================================================== */

export const startRecord = createAsyncThunk<
  { session_id: string },
  { id: string; end_time?: string | null; end_at?: number | null },
  { rejectValue: string }
>("record/start", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await recordApi.start(id);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
      err?.message ||
      "Gagal memulai recording"
    );
  }
});

/* =====================================================
   VERIFY PIN
===================================================== */

export const verifyPin = createAsyncThunk<
  void,
  { teacher_id: string; pin: string },
  { rejectValue: string }
>("record/verifyPin", async (payload, { rejectWithValue }) => {
  try {
    const res = await recordApi.checkPin(payload);
    // Based on user curl, we check status or handle success
    if (res.status !== 200) {
      return rejectWithValue(res.message || "PIN salah");
    }
    return;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
      err?.message ||
      "Gagal memverifikasi PIN"
    );
  }
});

/* =====================================================
   STOP RECORD
===================================================== */

export const stopRecord = createAsyncThunk<
  { isAuto?: boolean },
  { session_id: string; event_id: string; isAuto?: boolean },
  { rejectValue: string }
>("record/stop", async (payload, { rejectWithValue }) => {
  try {
    await recordApi.stop(payload);
    return { isAuto: payload.isAuto };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ||
      err?.message ||
      "Gagal menghentikan recording"
    );
  }
});

/* =====================================================
   SLICE
===================================================== */

const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    resetRecord(state) {
      state.isRecording = false;
      state.session_id = null;
      state.recordingEventId = null;
      state.recordingEventEndTime = null;
      state.recordingEventEndAt = null;
      state.startTime = null;
      state.duration = 0;
      state.error = null;
      state.loading = false;
      state.hasStoppedSession = false;
      state.stoppedAt = null;
      state.showSummary = false;
      state.showStopConfirm = false;
      state.finishedEvent = null;
      savePersistedState(state);
    },

    clearRecordingOnly(state) {
      state.isRecording = false;
      state.session_id = null;
      state.recordingEventId = null;
      state.recordingEventEndTime = null;
      state.recordingEventEndAt = null;
      state.startTime = null;
      state.duration = 0;
      state.loading = false;
      state.error = null;
      savePersistedState(state);
    },

    setShowSummary(state, action) {
      state.showSummary = action.payload;
    },
    setShowStopConfirm(state, action) {
      state.showStopConfirm = action.payload;
    },
    setFinishedEvent(state, action) {
      state.finishedEvent = action.payload;
    },

    /** Dipanggil saat event baru terdeteksi → reset flag session selesai */
    resetStoppedSession(state) {
      state.hasStoppedSession = false;
      state.stoppedAt = null;
      savePersistedState(state);
    },

    tick(state) {
      if (state.isRecording && state.startTime) {
        state.duration = Math.floor(
          (Date.now() - state.startTime) / 1000
        );
      }
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================
      // START RECORD
      // =====================
      .addCase(startRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.isRecording = true;
        state.session_id = action.payload.session_id;
        state.recordingEventId = action.meta.arg.id;
        state.recordingEventEndTime = action.meta.arg.end_time ?? null;
        state.recordingEventEndAt = action.meta.arg.end_at ?? null;
        state.startTime = Date.now();
        state.duration = 0;
        state.hasStoppedSession = false; // reset saat mulai rekaman baru
        state.showSummary = false;
        state.showStopConfirm = false;
        savePersistedState(state);
      })
      .addCase(startRecord.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Start recording gagal";
      })

      // =====================
      // STOP RECORD
      // =====================
      .addCase(stopRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.isRecording = false;
        state.session_id = null;
        state.recordingEventId = null;
        state.recordingEventEndTime = null;
        state.recordingEventEndAt = null;
        state.startTime = null;
        state.duration = 0;

        if (action.payload.isAuto) {
          state.hasStoppedSession = false;
          state.stoppedAt = null;
          state.showSummary = false;
          state.finishedEvent = null;
        } else {
          state.hasStoppedSession = true;
          state.stoppedAt = Date.now();
          state.showSummary = true;
        }
        savePersistedState(state);
      })
      .addCase(stopRecord.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Stop recording gagal";

        // CRITICAL: Even if the API call fails, we MUST stop the local recording state
        // otherwise the user gets stuck in a recording UI that can never be stopped.
        state.isRecording = false;
        state.session_id = null;
        state.recordingEventId = null;
        state.recordingEventEndTime = null;
        state.recordingEventEndAt = null;
        state.startTime = null;
        state.duration = 0;

        // Use the same logic as fulfilled to handle auto vs manual stop
        const isAuto = action.meta.arg?.isAuto;
        if (isAuto) {
          state.hasStoppedSession = false;
          state.stoppedAt = null;
          state.showSummary = false;
          state.finishedEvent = null;
        } else {
          state.hasStoppedSession = true;
          state.stoppedAt = Date.now();
          state.showSummary = true;
        }

        savePersistedState(state);
      })
      // VERIFY PIN
      .addCase(verifyPin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyPin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Verifikasi PIN gagal";
      });
  },
});

/* =====================================================
   EXPORT
==================================================== */

export const { resetRecord, clearRecordingOnly, resetStoppedSession, tick, clearError, setShowSummary, setShowStopConfirm, setFinishedEvent } =
  recordSlice.actions;

export default recordSlice.reducer;
