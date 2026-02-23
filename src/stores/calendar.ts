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
  loading: boolean;
  error: string | null;
  eventList: EventList | null;
};

const initialState: CalendarState = {
  events: [],
  loading: true,
  error: null,
  eventList: null,
};

const groupEventsByDate = (events: EventList[]): EventGroup[] => {
  const map = new Map<string, EventGroup>();

  events.forEach((event) => {
    const date = event.event_date;

    if (!map.has(date)) {
      map.set(date, {
        date,
        day: new Date(date).toLocaleDateString("id-ID", {
          weekday: "long",
        }),
        items: [],
      });
    }

    map.get(date)!.items.push({
      id: event.id,
      name: event.course_name,
      type: event.color || "grey",
      times: {
        start: event.start_time,
        end: event.end_time,
      },
    });
  });

  const data = Array.from(map.values());
  console.log("EventByDate: ", data);

  return data;
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
  },
);

export const fetchEventList = createAsyncThunk<
  EventList[],
  EventListPayload
>("calendar/fetchEventList", async (payload, { rejectWithValue }) => {
  try {
    const response: EventListResponse =
      await eventService.getEventList(payload);

    const CLASSROOM_ID = localStorage.getItem("class_id");

    const filtered = response.data.events.filter(
      (ev) => ev.class_room_id === CLASSROOM_ID
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
    return rejectWithValue(
      error?.message || "Failed to fetch event list"
    );
  }
});

export const fetchEventByClassroomDate = createAsyncThunk<
  EventList | null,
  EventListByDatePayload
>(
  "calendar/fetchEventByClassroomDate",
  async (payload, { rejectWithValue }) => {
    try {
      const response: EventListResponse =
        await eventService.getEventList(payload);

      const CLASSROOM_ID = localStorage.getItem('class_id');

      console.log("response.data.events: ", response.data.events);

      const filteredByClassroomId = response.data.events.find(
        (ev) => ev.class_room_id === CLASSROOM_ID,
      );
      console.log("filteredByClassroomId: ", filteredByClassroomId);

      if (!filteredByClassroomId) return null;

      return filteredByClassroomId;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch event list by classroom date",
      );
    }
  },
);

// const calendarSlice = createSlice({
//   name: "calendar",
//   initialState,
//   reducers: {
//     setEvents: (state, action: PayloadAction<EventGroup[]>) => {
//       state.events = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchEvents.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEvents.fulfilled, (state, action) => {
//         state.loading = false;
//         state.events = action.payload;
//       })
//       .addCase(fetchEvents.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventList.fulfilled, (state, action) => {
        state.loading = false;
        state.events = groupEventsByDate(action.payload);
      })
      .addCase(fetchEventList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchEventByClassroomDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventByClassroomDate.fulfilled, (state, action) => {
        state.loading = false;
        state.eventList = action.payload;
        console.log("eL: ", state.eventList);
        console.log("end time: ", state.eventList?.end_time);
      })
      .addCase(fetchEventByClassroomDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// export const { setEvents } = calendarSlice.actions;
export default calendarSlice.reducer;
