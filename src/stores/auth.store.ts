import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Class, TokenPayload, TokenResponse, User } from "../types/auth.types";
import { authService } from "../services/auth.service";
import { setError, setLoading } from "./ui.store";

type AuthState = {
  user: User | null;
  classList: Class[];
  errorPin: string;
  loading: boolean;
};

const initialState: AuthState = {
  user: null,
  classList: [],
  errorPin: "",
  loading: false,
};

type Token = {
  pin: string;
  classId?: string;
};

export const getToken = createAsyncThunk<TokenResponse, Token>(
  "auth/getToken",
  async (payload, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const correctPin = localStorage.getItem("pin");
      if (correctPin !== payload.pin) {
        return rejectWithValue("Invalid PIN");
      }

      const payloadData: TokenPayload = {
        pin: payload.pin,
        class_id: payload.classId || localStorage.getItem("class_id") || "",
      };

      const data = await authService.getToken(payloadData);
      return data;
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(error.message || "Failed to login");
    }
  }
);

export const fetchClass = createAsyncThunk<Class[]>(
  "auth/fetchClass",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));

      const data = await authService.getCLass();
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch class"));
      return rejectWithValue(error.message || "Failed to fetch class");
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
    setErrorPin: (state, action: PayloadAction<string>) => {
      state.errorPin = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Token
    builder
      .addCase(getToken.pending, (state) => {
        state.errorPin = "";
        state.loading = true;
      })
      .addCase(getToken.fulfilled, (state, action) => {
        state.loading = false;
        sessionStorage.setItem("token", action.payload.token);
      })
      .addCase(getToken.rejected, (state, action) => {
        state.errorPin = action.payload as string;
        state.loading = false;
      });

    // Get Class
    builder.addCase(fetchClass.fulfilled, (state, action) => {
      state.classList = action.payload;
    });

    // Get User
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { setUser, setErrorPin } = authSlice.actions;
export default authSlice.reducer;
