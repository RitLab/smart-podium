import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Participant, ParticipantList } from "../types/student.type";
import { studentService } from "../services/student.services";
import { Pagination } from "../types/index.types";

type StudentState = {
  participantList?: Participant[];
  pagination?: Pagination;
  loading: boolean;
  error: string | null;
};

const initialState: StudentState = {
  participantList: undefined,
  pagination: undefined,
  loading: false,
  error: null,
};

export const fetchParticipantList = createAsyncThunk<ParticipantList>(
  "student/fetchParticipantList",
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentService.getParticipantList();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setParticipantList: (state, action: PayloadAction<Participant[]>) => {
      state.participantList = action.payload;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipantList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParticipantList.fulfilled, (state, action) => {
        state.loading = false;
        state.participantList = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          page_count: action.payload.page_count,
          per_page: action.payload.per_page,
          total_count: action.payload.total_count,
        };
      })
      .addCase(fetchParticipantList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });
  },
});

export const { setParticipantList, setPagination } = studentSlice.actions;
export default studentSlice.reducer;
