import { baseURL, handler } from ".";
import type { EventGroup } from "@/types/event";

export const eventService = {
  getEvents: async (): Promise<EventGroup[]> => {
    // return await handler.get<EventGroup[]>(`${baseURL}/events`);
    return [
      {
        date: "1 September 2025",
        day: "Senin",
        items: [
          {
            id: 1,
            name: "Ujian Tengah Semester",
            type: "yellow",
            times: {
              start: "7.00 AM",
              end: "3.00 PM",
            },
          },
        ],
      },
      {
        date: "2 September 2025",
        day: "Selasa",
        items: [
          {
            id: 1,
            name: "Ujian Tengah Semester",
            type: "yellow",
            times: {
              start: "7.00 AM",
              end: "3.00 PM",
            },
          },
        ],
      },
      {
        date: "3 September 2025",
        day: "Rabu",
        items: [
          {
            id: 1,
            name: "Ujian Tengah Semester",
            type: "yellow",
            times: {
              start: "7.00 AM",
              end: "3.00 PM",
            },
          },
        ],
      },
      {
        date: "4 September 2025",
        day: "Kamis",
        items: [
          {
            id: 1,
            name: "Ujian Tengah Semester",
            type: "yellow",
            times: {
              start: "7.00 AM",
              end: "3.00 PM",
            },
          },
        ],
      },
      {
        date: "5 September 2025",
        day: "Jumat",
        items: [
          {
            id: 1,
            name: "Cuti Bersama Maulid Nabi Muhammad",
            type: "red",
          },
        ],
      },
      {
        date: "8 September 2025",
        day: "Senin",
        items: [
          {
            id: 1,
            name: "Ujian Tengah Semester",
            type: "yellow",
            times: {
              start: "7.00 AM",
              end: "3.00 PM",
            },
          },
        ],
      },
    ];
  },
};
