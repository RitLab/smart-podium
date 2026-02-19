import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  Attendance,
  AttendancePayload,
  AttendanceResponse,
  UpdateAttendance,
} from "@/types/student";
import { studentService } from "@/services/student";
import { setError, setLoading } from "./ui";
import type { RootState } from ".";
import { EmptyResponse } from "@/types";

type TotalType = {
  total_present: number;
  total_absent: number;
};

type StudentState = {
  attendanceList: Attendance[];
  total: TotalType;
};

const initialState: StudentState = {
  attendanceList: [],
  total: {
    total_present: 0,
    total_absent: 0,
  },
};

export const fetchAttendance = createAsyncThunk<
  AttendanceResponse,
  AttendancePayload
>("student/fetchAttendance", async (payload, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(""));

    const data = await studentService.getAttendance(payload);
    return data;
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to fetch attendance list"));
    return rejectWithValue(error.message || "Failed to fetch attendance list");
  } finally {
    dispatch(setLoading(false));
  }
});

export const updateAttendance = createAsyncThunk<
  EmptyResponse,
  UpdateAttendance,
  { state: RootState }
>(
  "student/updateAttendance",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await studentService.updateAttendance(payload);
      return data;
    } catch (error: any) {
      // dispatch(setError(error.message || "Failed to fetch student list"));
      return rejectWithValue(error.message || "Failed to fetch student list");
    } finally {
      dispatch(setLoading(false));
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setAttendanceList: (state, action: PayloadAction<Attendance[]>) => {
      state.attendanceList = action.payload;
    },
    setTotal: (state, action: PayloadAction<TotalType>) => {
      state.total = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAttendance.fulfilled, (state, action) => {
      let total_present = 0;
      let total_absent = 0;
      const attendances = action.payload.data.attendances;

      state.attendanceList = attendances;

      attendances.map((item) => {
        if (item.attendance_status > 1) {
          total_absent += 1;
        } else {
          total_present += 1;
        }
      });

      state.total = { total_absent, total_present };
    });
  },
});

export const { setAttendanceList, setTotal } = studentSlice.actions;
export default studentSlice.reducer;
