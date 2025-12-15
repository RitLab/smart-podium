import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./ui";
import authReducer from "./auth";
import calendarReducer from "./calendar";
import studentReducer from "./student";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    calendar: calendarReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
