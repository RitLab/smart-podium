import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ReferensiItem, BahanAjarItem, BahanAjarDetail } from "@/types/module";
import { moduleApi } from "@/services/module";

type ModuleState = {
  referensi: ReferensiItem[];
  list: BahanAjarItem[];
  total: number;
  detail: BahanAjarDetail | null;
  loading: boolean;
  error: string | null;
};

const initialState: ModuleState = {
  referensi: [],
  list: [],
  total: 0,
  detail: null,
  loading: false,
  error: null,
};

export const fetchReferensi = createAsyncThunk<
  ReferensiItem[]
>("module/fetchReferensi", async () => {
  try {
    const res = await moduleApi.getReferensi();
    return res.data;
  } catch (error: any) {
    return error?.message;
  }
});

export const fetchBahanAjarList = createAsyncThunk<
  { rows: BahanAjarItem[]; total: number },
  any
>("module/fetchBahanAjarList", async (payload, { rejectWithValue }) => {
  try {
    const res = await moduleApi.getList(payload);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Gagal mengambil list bahan ajar");
  }
});

export const fetchBahanAjarDetail = createAsyncThunk<BahanAjarDetail, number>(
  "module/fetchBahanAjarDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await moduleApi.getDetail(id);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Gagal mengambil detail bahan ajar",
      );
    }
  },
);

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // referensi
      .addCase(fetchReferensi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferensi.fulfilled, (state, action) => {
        state.loading = false;
        state.referensi = action.payload;
      })
      .addCase(fetchReferensi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // list
      .addCase(fetchBahanAjarList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBahanAjarList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.rows;
        console.log(state.list)
        state.total = action.payload.total;
      })
      .addCase(fetchBahanAjarList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // detail
      .addCase(fetchBahanAjarDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBahanAjarDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchBahanAjarDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default moduleSlice.reducer;
