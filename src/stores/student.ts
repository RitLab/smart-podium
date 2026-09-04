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

/**
 * Kelas yang belum mulai bukan error. Backend balikin HTTP 400 dengan pesan
 * "Class schedule not started yet!", padahal podium memang sering nampilin
 * jadwal yang belum jalan (pagi sebelum kelas pertama, activeEventId jatuh ke
 * event yang akan datang). Ditandai pakai sentinel biar halaman Siswa bisa
 * nampilin empty state yang ramah, bukan kotak merah berisi pesan bahasa
 * Inggris dari server.
 */
export const CLASS_NOT_STARTED = "CLASS_NOT_STARTED";

export const fetchAttendance = createAsyncThunk<
  AttendanceResponse,
  AttendancePayload | null,
  { rejectValue: string }
>("student/fetchAttendance", async (payload, { rejectWithValue }) => {
  try {
    const data = await studentService.getAttendance(payload ?? undefined);
    return data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Gagal mengambil data kehadiran";
    if (error.response?.status === 400 && /not started/i.test(String(message))) {
      return rejectWithValue(CLASS_NOT_STARTED);
    }
    return rejectWithValue(message);
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
    clearAttendance: (state) => {
      state.attendanceList = [];
      state.total = { total_present: 0, total_absent: 0 };
      state.teacher = { teacher_name: "", teacher_id: "" };
      state.error = null;
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
        // Event tanpa kelas dibalikin BE sebagai list kosong dengan status 200.
        // Null juga dianggap kosong biar .map di bawah nggak meledak.
        const attendances = Array.isArray(action.payload.data?.attendances)
          ? action.payload.data.attendances
          : [];

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
        // Kelas belum mulai bukan kegagalan, jadi jangan diisi ke error.
        state.error = action.payload === CLASS_NOT_STARTED ? null : (action.payload as string);
        // Lebih baik kosong daripada guru ngabsen daftar siswa punya event lain.
        state.attendanceList = [];
        state.total = { total_present: 0, total_absent: 0 };
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

export const { setAttendanceList, setTotal, clearAttendance } = studentSlice.actions;
export default studentSlice.reducer;
