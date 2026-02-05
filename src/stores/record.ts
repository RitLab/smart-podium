import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { recordApi } from "@/services/record";

type RecordState = {
  isRecording: boolean;
  recordId: number | null;
  startTime: number | null; // timestamp (ms)
  duration: number; // detik
  loading: boolean;
  error: string | null;
};

const initialState: RecordState = {
  isRecording: false,
  recordId: null,
  startTime: null,
  duration: 0,
  loading: false,
  error: null,
};

/**
 * API start recording
 */
export const startRecord = createAsyncThunk<
  { record_id: number; started_at: string },
  { module_id?: number } | void
>("record/start", async (payload, { rejectWithValue }) => {
  try {
    const res = await recordApi.start(payload || {});
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Gagal memulai recording");
  }
});

const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    resetRecord(state) {
      state.isRecording = false;
      state.recordId = null;
      state.startTime = null;
      state.duration = 0;
    },

    /**
     * Dipanggil tiap 1 detik dari component
     */
    tick(state) {
      if (state.isRecording && state.startTime) {
        state.duration = Math.floor(
          (Date.now() - state.startTime) / 1000
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(startRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.isRecording = true;

        state.recordId = action.payload.record_id;

        // ⬅️ INI PENTING
        // waktu dikunci di store, bukan di component
        state.startTime = Date.now();
        state.duration = 0;
      })

      .addCase(startRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetRecord, tick } = recordSlice.actions;
export default recordSlice.reducer;
