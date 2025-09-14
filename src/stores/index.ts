import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth";
import calendarReducer from './calendar';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    calendar: calendarReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;