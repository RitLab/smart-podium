import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CalendarComponents from "@/components/Calendar";
import type { AppDispatch, RootState } from "@/stores";
import { fetchEvents, fetchEventList } from "@/stores/calendar";
import type { DateClick } from "@/types/event";

const Calendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.calendar
  );

  const calendarRef = useRef<HTMLDivElement>(null);
  // const [height, setHeight] = useState<number>();
  const [dateClick, setDateClick] = useState<{
    year: number;
    month: number;
    day: number;
  }>();

  // fetch data event
  // useEffect(() => {
  //   dispatch(fetchEvents());
  // }, [dispatch]);

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    dispatch(
      fetchEventList({
        month,
        year,
      })
    );
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const colorMap: Record<string, string> = {
    red: "bg-red-200 text-red-800",
    blue: "bg-blue-200 text-blue-800",
    yellow: "bg-yellow-200 text-yellow-800",
    black: "bg-blue-200 text-blue-800",
    grey: "bg-gray-300 text-black",
  };

  const onDateClick = (date: DateClick) => {
    setDateClick(date);
  };

  const monthMap: Record<number, string> = {
    1: "Januari",
    2: "Februari",
    3: "Maret",
    4: "April",
    5: "Mei",
    6: "Juni",
    7: "Juli",
    8: "Agustus",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
  };

  const selectedDateString = dateClick
    ? `${dateClick.day} ${monthMap[dateClick.month]} ${dateClick.year}`
    : null;

  const filteredEvents = selectedDateString
    ? events.filter((ev) => ev.date === selectedDateString)
    : events;

  return (
    <div className="grid grid-cols-3 w-full h-[780px] gap-4 box-border">
      {/* Calendar section */}
      <div className="col-span-2 shadow-lg h-full">
        <CalendarComponents events={events} onDateClick={onDateClick} />
      </div>

      {/* Event list section */}
      <div
        id="calendarEvent"
        className="w-full shadow-lg px-6 py-6 bg-white rounded-md h-full overflow-y-auto"
      >
        <div className="text-xs flex flex-col gap-4">
          {filteredEvents.map((ev) => (
            <div key={ev.date}>
              <p className="font-medium">
                {ev.day}, {ev.date}
              </p>
              <div className="flex flex-col mt-1 gap-2">
                {ev.items.map((item) => (
                  <div
                    key={item.id}
                    className={`${colorMap[item.type]} p-2 rounded-md text-xs`}
                  >
                    <div className="flex justify-between">
                      <p className="font-semibold">{item.name}</p>
                      <p>{ev.date}</p>
                    </div>

                    {item.times && (
                      <div className="mt-2">
                        <p>
                          {item.times.start} - {item.times.end}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
