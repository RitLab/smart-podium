import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth, ForgotPassword, Login, User } from "../types/auth.types";
import { authService } from "../services/auth.service";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<Auth, Login>(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.login(payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

export const logoutUser = createAsyncThunk<Auth>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.logout();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

export const forgotPassUser = createAsyncThunk<Auth, ForgotPassword>(
  "auth/forgotPassUser",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.forgotPassword(payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

export const fetchUser = createAsyncThunk<User>(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getUser();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        localStorage.setItem("token", "");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPassUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });

    // Get User
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
