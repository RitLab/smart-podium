import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Auth, ForgotPassword, Login, User } from "../types/auth.types";
import { authService } from "../services/auth.service";
import { setError, setLoading } from "./ui.store";

type AuthState = {
  user: User | null;
};

const initialState: AuthState = {
  user: null,
};

export const loginUser = createAsyncThunk<Auth, Login>(
  "auth/loginUser",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await authService.login(payload);
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to login"));
      return rejectWithValue(error.message || "Failed to login");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logoutUser = createAsyncThunk<Auth>(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await authService.logout();
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to logout"));
      return rejectWithValue(error.message || "Failed to logout");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const forgotPassUser = createAsyncThunk<Auth, ForgotPassword>(
  "auth/forgotPassUser",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await authService.forgotPassword(payload);
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to forgot password"));
      return rejectWithValue(error.message || "Failed to forgot password");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchUser = createAsyncThunk<User>(
  "auth/fetchUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await authService.getUser();
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch user"));
      return rejectWithValue(error.message || "Failed to fetch user");
    } finally {
      dispatch(setLoading(false));
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
    builder.addCase(loginUser.fulfilled, (_, action) => {
      localStorage.setItem("token", action.payload.token);
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      localStorage.setItem("token", "");
    });

    // Forgot Password
    builder.addCase(forgotPassUser.fulfilled, (state) => {
      state.user = null;
      localStorage.setItem("token", "");
    });

    // Get User
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
