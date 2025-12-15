import { baseURL, handler } from ".";
import type { EventGroup } from "@/types/event.types";

export const eventService = {
  getEvents: async (): Promise<EventGroup[]> => {
    return await handler.get<EventGroup[]>(`${baseURL}/events`);
  },
};
