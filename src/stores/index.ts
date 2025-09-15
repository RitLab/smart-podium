import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth.store";
import calendarReducer from "./calendar";
import studentReducer from "./student.store";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    calendar: calendarReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
