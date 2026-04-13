import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  loading: boolean;
  error: string;
  isFullScreen: boolean;
};

const initialState: UIState = {
  loading: false,
  error: "",
  isFullScreen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = "";
    },
    setFullScreen: (state, action: PayloadAction<boolean>) => {
      state.isFullScreen = action.payload;
    },
  },
});

export const { setLoading, setError, clearError, setFullScreen } = uiSlice.actions;
export default uiSlice.reducer;
