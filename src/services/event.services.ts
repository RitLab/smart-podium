import { EventGroup } from "../types/event.types";
import handler from "./handler";

export const eventService = {
  getEvents: async (): Promise<EventGroup[]> => {
    const data = await handler.get<EventGroup[]>("/events");
    return data;
  },
};
