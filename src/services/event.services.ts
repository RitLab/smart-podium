import { EventGroup } from "../types/event.types";
import { baseURL, handler } from ".";

export const eventService = {
  getEvents: async (): Promise<EventGroup[]> => {
    return await handler.get<EventGroup[]>(`${baseURL}/events`);
  },
};
