// src/stores/record.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { recordApi } from "@/services/record";

type RecordState = {
  isRecording: boolean;
  session_id: string | null;
  startTime: number | null; // timestamp (ms)
  duration: number; // detik
  loading: boolean;
  error: string | null;
};

const initialState: RecordState = {
  isRecording: false,
  session_id: null,
  startTime: null,
  duration: 0,
  loading: false,
  error: null,
};

/**
 * START RECORDING
 * GET /portal/video/{event_id}/start
 */
export const startRecord = createAsyncThunk<
  { session_id: string },
  { id: string },
  { rejectValue: string }
>("record/start", async (payload, { rejectWithValue }) => {
  try {
    const res = await recordApi.start(payload.id);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Gagal memulai recording",
    );
  }
});

/**
 * STOP RECORDING
 * POST /portal/video/stop
 */
export const stopRecord = createAsyncThunk<
  void,
  { session_id: string; event_id: string },
  { rejectValue: string }
>("record/stop", async (payload, { rejectWithValue }) => {
  try {
    await recordApi.stop(payload);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Gagal menghentikan recording",
    );
  }
});

const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    resetRecord(state) {
      state.isRecording = false;
      state.session_id = null;
      state.startTime = null;
      state.duration = 0;
      state.loading = false;
      state.error = null;
    },

    /**
     * Dipanggil tiap 1 detik dari component
     */
    tick(state) {
      if (state.isRecording && state.startTime) {
        state.duration = Math.floor((Date.now() - state.startTime) / 1000);
      }
    },
  },
  extraReducers: (builder) => {
    builder

      // =====================
      // START
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
      })
      .addCase(startRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Start recording gagal";
      })

      // =====================
      // STOP
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
      })
      .addCase(stopRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Stop recording gagal";
      });
  },
});

export const { resetRecord, tick } = recordSlice.actions;
export default recordSlice.reducer;
