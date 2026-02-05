import { baseWhisperUrl, handler } from ".";
import type { EventGroup, EventListPayload, EventListResponse } from "@/types/event";

export const eventService = {
  getEvents: async (): Promise<EventGroup[]> => {
    // return await handler.get<EventGroup[]>(`${baseWhisperUrl}/events`);
    return [
      {
        date: "1 Januari 2026",
        day: "Kamis",
        items: [
          {
            id: '1',
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
        date: "2 Januari 2026",
        day: "Jumat",
        items: [
          {
            id: '1',
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
        date: "3 Januari 2026",
        day: "Sabtu",
        items: [
          {
            id: '1',
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
        date: "4 Januari 2026",
        day: "Minggu",
        items: [
          {
            id: '1',
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
        date: "5 Januari 2026",
        day: "Senin",
        items: [
          {
            id: '1',
            name: "Cuti Bersama Maulid Nabi Muhammad",
            type: "red",
          },
        ],
      },
      {
        date: "8 Januari 2026",
        day: "Kamis",
        items: [
          {
            id: '1',
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
  getEventList: async (payload: EventListPayload): Promise<EventListResponse> => {
    const url = `${baseWhisperUrl}/portal/event`;
    return await handler.get<EventListResponse>(url, payload);
  }
};
