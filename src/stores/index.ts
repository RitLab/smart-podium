import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./ui";
import authReducer from "./auth";
import calendarReducer from "./calendar";
import studentReducer from "./student";
import moduleReducer from "./module";
import recordReducer from "./record";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    calendar: calendarReducer,
    student: studentReducer,
    module: moduleReducer,
    record: recordReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
