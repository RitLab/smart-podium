import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./ui.store";
import authReducer from "./auth.store";
import calendarReducer from "./calendar.store";
import studentReducer from "./student.store";

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
