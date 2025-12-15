import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { eventService } from "@/services/event";
import type { EventGroup } from "@/types/event";

type CalendarState = {
  events: EventGroup[];
  loading: boolean;
  error: string | null;
};

const initialState: CalendarState = {
  events: [],
  loading: true,
  error: null,
};

export const fetchEvents = createAsyncThunk<EventGroup[]>(
  "calendar/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await eventService.getEvents();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<EventGroup[]>) => {
      state.events = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEvents } = calendarSlice.actions;
export default calendarSlice.reducer;
