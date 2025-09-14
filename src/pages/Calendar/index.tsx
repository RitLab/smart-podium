import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CalendarComponents from "../../components/Calendar";
import type { AppDispatch, RootState } from "../../stores";
import { fetchEvents } from "../../stores/calendar";
import { DateClick } from "../../types/event.types";

const Calendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.calendar
  );

  const calendarRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const [dateClick, setDateClick] = useState<{year: number; month: number; day: number}>()

  // set calendar height for event list section height
  useEffect(() => {
    const updateHeight = () => {
      if (calendarRef.current) {
        setHeight(calendarRef.current.offsetHeight);
      }
    };

    updateHeight(); // panggil pertama kali
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // fetch data event
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const colorMap: Record<string, string> = {
    red: "bg-red-200 text-red-800",
    blue: "bg-blue-200 text-blue-800",
    yellow: "bg-yellow-200 text-yellow-800",
  };

  const onDateClick = (date: DateClick) => {
    setDateClick(date)
  }

  return (
    <div className="grid grid-cols-3 w-full gap-4">
      {/* Calendar section */}
      <div className="col-span-2" ref={calendarRef}>
        <CalendarComponents events={events} onDateClick={onDateClick} />
      </div>

      {/* Event list section */}
      <div
        id="calendarEvent"
        className="w-full shadow-lg p-8 bg-white rounded-md overflow-scroll"
        style={{ height }}
      >
        <div>{dateClick?.year} - {dateClick?.month} - {dateClick?.day}</div>
        <div className="text-xs flex flex-col gap-4">
          {events.map((ev) => (
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
