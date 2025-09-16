import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Participant, ParticipantList } from "../types/student.type";
import { studentService } from "../services/student.services";
import { Pagination } from "../types/index.types";
import { setError, setLoading } from "./ui.store";

type StudentState = {
  participantList?: Participant[];
  pagination?: Pagination;
};

const initialState: StudentState = {
  participantList: undefined,
  pagination: undefined,
};

export const fetchParticipantList = createAsyncThunk<ParticipantList>(
  "student/fetchParticipantList",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await studentService.getParticipantList();
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch participant list"));
      return rejectWithValue(
        error.message || "Failed to fetch participant list"
      );
    } finally {
      dispatch(setLoading(false));
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
    builder.addCase(fetchParticipantList.fulfilled, (state, action) => {
      state.participantList = action.payload.data;
      state.pagination = {
        page: action.payload.page,
        page_count: action.payload.page_count,
        per_page: action.payload.per_page,
        total_count: action.payload.total_count,
      };
    });
  },
});

export const { setParticipantList, setPagination } = studentSlice.actions;
export default studentSlice.reducer;
