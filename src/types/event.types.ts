export type EventItem = {
  id: number;
  name: string;
  type: "red" | "blue" | "yellow";
  times?: {
    start: string;
    end: string;
  };
};

export type EventGroup = {
  date: string;
  day: string;
  items: EventItem[];
};

export type DateClick = {
  year: number;
  month: number;
  day: number;
};
