// src/stores/record.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { recordApi } from "@/services/record";

/* =====================================================
   TYPES
===================================================== */

export type RecordState = {
  isRecording: boolean;
  session_id: string | null;
  startTime: number | null; // timestamp (ms)
  duration: number; // dalam detik
  loading: boolean;
  error: string | null;
  /** true setelah stopRecord berhasil, reset saat event baru/start baru */
  hasStoppedSession: boolean;
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
    const { isRecording, session_id, startTime, hasStoppedSession } = state;
    localStorage.setItem(
      RECOVERY_KEY,
      JSON.stringify({ isRecording, session_id, startTime, hasStoppedSession })
    );
  } catch (err) {
    // ignore
  }
};

const persisted = loadPersistedState();

const initialState: RecordState = {
  isRecording: persisted.isRecording ?? false,
  session_id: persisted.session_id ?? null,
  startTime: persisted.startTime ?? null,
  duration: persisted.startTime
    ? Math.floor((Date.now() - persisted.startTime) / 1000)
    : 0,
  loading: false,
  error: null,
  hasStoppedSession: persisted.hasStoppedSession ?? false,
};

/* =====================================================
   START RECORD
===================================================== */

export const startRecord = createAsyncThunk<
  { session_id: string },
  { id: string },
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
   STOP RECORD
===================================================== */

export const stopRecord = createAsyncThunk<
  void,
  { session_id: string; event_id: string },
  { rejectValue: string }
>("record/stop", async (payload, { rejectWithValue }) => {
  try {
    await recordApi.stop(payload);
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
      state.startTime = null;
      state.duration = 0;
      state.error = null;
      state.loading = false;
      state.hasStoppedSession = false;
      savePersistedState(state);
    },

    /** Dipanggil saat event baru terdeteksi → reset flag session selesai */
    resetStoppedSession(state) {
      state.hasStoppedSession = false;
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
        state.startTime = Date.now();
        state.duration = 0;
        state.hasStoppedSession = false; // reset saat mulai rekaman baru
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
      .addCase(stopRecord.fulfilled, (state) => {
        state.loading = false;
        state.isRecording = false;
        state.session_id = null;
        state.startTime = null;
        state.duration = 0;
        state.hasStoppedSession = true; // flag: sesi ini sudah dihentikan
        savePersistedState(state);
      })
      .addCase(stopRecord.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Stop recording gagal";
      });
  },
});

/* =====================================================
   EXPORT
===================================================== */

export const { resetRecord, resetStoppedSession, tick, clearError } =
  recordSlice.actions;

export default recordSlice.reducer;
