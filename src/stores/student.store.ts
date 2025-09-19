import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Student,
  StudentList,
  UpdateStatusPayload,
} from "../types/student.type";
import { studentService } from "../services/student.services";
import { Pagination, PaginationParams } from "../types/index.types";
import { setError, setLoading } from "./ui.store";
import { RootState } from ".";

type TotalType = {
  total_present: number;
  total_absent: number;
  total_loa: number;
};

type StudentState = {
  studentList: Student[];
  pagination: Pagination;
  total: TotalType;
};

const initialState: StudentState = {
  studentList: [],
  pagination: { page: 1, page_count: 1, per_page: 10, total_count: 0 },
  total: {
    total_present: 0,
    total_absent: 0,
    total_loa: 0,
  },
};

export const fetchStudents = createAsyncThunk<StudentList, PaginationParams>(
  "student/fetchStudents",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await studentService.getStudents(payload);
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch student list"));
      return rejectWithValue(error.message || "Failed to fetch student list");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateStatusStudent = createAsyncThunk<
  any,
  UpdateStatusPayload,
  { state: RootState }
>(
  "student/updateStatusStudent",
  async (payload, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await studentService.updateStatusStudent(payload);
      const { page, per_page } = getState().student.pagination;
      if (data) {
        dispatch(fetchStudents({ page, per_page }));
      }
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch student list"));
      return rejectWithValue(error.message || "Failed to fetch student list");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudentList: (state, action: PayloadAction<Student[]>) => {
      state.studentList = action.payload;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setTotal: (state, action: PayloadAction<TotalType>) => {
      state.total = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStudents.fulfilled, (state, action) => {
      state.studentList = action.payload.students;
      state.pagination = action.payload.pagination;
      state.total = {
        total_absent: action.payload.total_absent,
        total_loa: action.payload.total_loa,
        total_present: action.payload.total_present,
      };
    });
  },
});

export const { setStudentList, setTotal, setPagination } = studentSlice.actions;
export default studentSlice.reducer;
