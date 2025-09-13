import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    name: "Budi",
  }, // null = belum login
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload; // payload = data user
    },
    logout: (state) => {
      state.user = {
        name: "",
      };
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
