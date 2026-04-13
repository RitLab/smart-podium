import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  Attendance,
  AttendancePayload,
  AttendanceResponse,
  TeacherType,
  UpdateAttendance,
} from "@/types/student";
import { studentService } from "@/services/student";
import type { RootState } from ".";
import { EmptyResponse } from "@/types";

type TotalType = {
  total_present: number;
  total_absent: number;
};

type StudentState = {
  attendanceList: Attendance[];
  total: TotalType;
  teacher: TeacherType;
  loading: boolean;
  error: string | null;
};

const initialState: StudentState = {
  attendanceList: [],
  total: {
    total_present: 0,
    total_absent: 0,
  },
  teacher: {
    teacher_name: "",
    teacher_id: "",
  },
  loading: false,
  error: null,
};

export const fetchAttendance = createAsyncThunk<
  AttendanceResponse,
  AttendancePayload | null,
  { rejectValue: string }
>("student/fetchAttendance", async (payload, { rejectWithValue }) => {
  try {
    const data = await studentService.getAttendance(payload ?? undefined);
    return data;
  } catch (error: any) {
    return rejectWithValue(error?.toString() || "Gagal mengambil data kehadiran");
  }
});

export const updateAttendance = createAsyncThunk<
  EmptyResponse,
  UpdateAttendance,
  { state: RootState; rejectValue: string }
>(
  "student/updateAttendance",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await studentService.updateAttendance(payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error?.toString() || "Gagal memperbarui kehadiran");
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
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        let total_present = 0;
        let total_absent = 0;
        const attendances = action.payload.data.attendances;

        state.attendanceList = attendances;
        state.teacher = {
          teacher_name: action.payload.data.teacher_name,
          teacher_id: action.payload.data.teacher_id,
        };

        attendances.map((item) => {
          if (item.attendance_status > 1) {
            total_absent += 1;
          } else {
            total_present += 1;
          }
        });

        state.total = { total_absent, total_present };
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAttendanceList, setTotal } = studentSlice.actions;
export default studentSlice.reducer;
