import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { eventService } from "@/services/event";
import type {
  EventGroup,
  EventListPayload,
  EventListResponse,
  EventList,
  EventListByDatePayload,
} from "@/types/event";

type CalendarState = {
  events: EventGroup[];
  rawEvents: EventList[];
  holidays: EventList[];
  headerEvents: EventList[];
  loading: boolean;
  error: string | null;
  eventList: EventList | null;
};

const initialState: CalendarState = {
  events: [],
  rawEvents: [],
  holidays: [],
  headerEvents: [],
  loading: false,
  error: null,
  eventList: null,
};

/* ================= UTILS ================= */
const groupEventsByDate = (events: EventList[]): EventGroup[] => {
  const map = new Map<string, EventGroup & { rawDate: number }>();

  events.forEach((event) => {
    const dateObj = new Date(event.event_date);
    if (isNaN(dateObj.getTime())) return;

    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (!map.has(formattedDate)) {
      map.set(formattedDate, {
        date: formattedDate,
        day: dateObj.toLocaleDateString("id-ID", {
          weekday: "long",
        }),
        items: [],
        rawDate: dateObj.getTime(),
      });
    }

    map.get(formattedDate)!.items.push({
      id: event.id,
      name: event.course_name,
      type: event.color || "grey",
      times: {
        start: event.start_time,
        end: event.end_time,
      },
    });
  });

  return Array.from(map.values())
    .sort((a, b) => a.rawDate - b.rawDate)
    .map(({ rawDate, ...rest }) => rest); // optional: buang rawDate
};

/* ================= THUNKS ================= */
export const fetchHeaderEvents = createAsyncThunk<
  EventList[],
  EventListPayload
>("calendar/fetchHeaderEvents", async (payload, { rejectWithValue }) => {
  try {
    const response: EventListResponse =
      await eventService.getEventList(payload);

    const CLASSROOM_ID = localStorage.getItem("class_id");

    const filtered = response.data.events.filter(
      (ev) => ev.class_room_id === CLASSROOM_ID,
    );

    return filtered.map((event) => {
      const date = new Date(event.event_date);
      return {
        ...event,
        event_date: date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
    });
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch header events");
  }
});

export const fetchEvents = createAsyncThunk<EventGroup[]>(
  "calendar/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await eventService.getEvents();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  },
);

export const fetchEventList = createAsyncThunk<EventList[], EventListPayload>(
  "calendar/fetchEventList",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `https://libur.deno.dev/api?year=${payload.year}`,
      );
      const data = await res.json();

      const filtered = data.filter((h: any) => {
        const date = new Date(h.date);
        return (
          date.getMonth() + 1 === payload.month &&
          date.getFullYear() === payload.year
        );
      });

      const holidays = filtered.map((h: any) => ({
        id: `holiday-${h.date}`,
        course_name: h.name,
        event_date: h.date,
        start_time: "",
        end_time: "",
        color: "red",
        class_room_id: null,
      }));
      const response: EventListResponse =
        await eventService.getEventList(payload);

      const CLASSROOM_ID = localStorage.getItem("class_id");

      const filteredDataEvents = response.data.events.filter(
        (ev) => ev.class_room_id === CLASSROOM_ID,
      );

      const merged = [...holidays, ...filteredDataEvents];
      return merged;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch event list");
    }
  },
);

export const fetchEventByClassroomDate = createAsyncThunk<
  EventList | null,
  EventListByDatePayload
>(
  "calendar/fetchEventByClassroomDate",
  async (payload, { rejectWithValue }) => {
    try {
      const response: EventListResponse =
        await eventService.getEventList(payload);

      const CLASSROOM_ID = localStorage.getItem("class_id");

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      const filtered = response.data.events.find(
        (ev) => ev.class_room_id === CLASSROOM_ID && ev.end_time < currentTime,
      );

      if (!filtered) return null;

      return filtered;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch event list by classroom date",
      );
    }
  },
);

/* ================= SLICE ================= */
const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ===== EVENT LIST ===== */
    builder
      .addCase(fetchEventList.pending, (state) => {
        if (state.rawEvents.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchEventList.fulfilled, (state, action) => {
        state.loading = false;
        state.rawEvents = action.payload;
        const merged = [...action.payload, ...state.holidays];

        state.events = groupEventsByDate(merged);
      })
      .addCase(fetchEventList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    /* ===== HEADER EVENTS (TETAP ADA) ===== */
    builder.addCase(fetchHeaderEvents.fulfilled, (state, action) => {
      state.headerEvents = action.payload;
    });

    /* ===== EVENT BY DATE ===== */
    builder
      .addCase(fetchEventByClassroomDate.pending, (state) => {
        if (state.eventList === null) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchEventByClassroomDate.fulfilled, (state, action) => {
        state.loading = false;
        state.eventList = action.payload;
      })
      .addCase(fetchEventByClassroomDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default calendarSlice.reducer;
