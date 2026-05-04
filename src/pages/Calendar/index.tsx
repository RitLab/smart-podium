import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CalendarComponents from "@/components/Calendar";
import type { AppDispatch, RootState } from "@/stores";
import { fetchEventList, fetchHolidays } from "@/stores/calendar";
import type { DateClick } from "@/types/event";

/* ================= TYPES ================= */
type EventItem = {
  id: string;
  name: string;
  type: string;
  times?: {
    start: string;
    end: string;
  };
};

type EventGroup = {
  date: string;
  day: string;
  items: EventItem[];
};

/* ================= COMPONENT ================= */
const Calendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, error } = useSelector((state: RootState) => state.calendar);

  const [dateClick, setDateClick] = useState<{
    year: number;
    month: number;
    day: number;
  }>();

  /* ================= INIT DATE ================= */
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    setDateClick({
      year,
      month,
      day: today.getDate(),
    });

    // 🔥 cukup trigger event list (calendar akan call onMonthChange juga)
    dispatch(fetchEventList({ month, year }));
  }, [dispatch]);

  /* ================= FETCH EVENTS ================= */
  const lastFetchRef = useRef<string>("");

  const handleMonthChange = useCallback(
    (month: number, year: number) => {
      const fetchKey = `${year}-${month}`;
      if (lastFetchRef.current === fetchKey) return;

      lastFetchRef.current = fetchKey;

      dispatch(fetchHolidays({ month, year }));
      dispatch(fetchEventList({ month, year }));
    },
    [dispatch],
  );

  /* ================= UTILS ================= */
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

  /* ================= FILTER ================= */
  const selectedDateString = dateClick
    ? `${dateClick.day} ${monthMap[dateClick.month]} ${dateClick.year}`
    : null;

  const filteredEvents = selectedDateString
    ? events.filter((ev) => ev.date === selectedDateString)
    : events;

  /* ================= UI ================= */
  const colorMap: Record<string, string> = {
    red: "bg-red-50 text-red-600 border-red-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    gray: "bg-gray-50 text-gray-500 border-gray-200",
  };

  const onDateClick = (date: DateClick) => {
    if (
      dateClick &&
      dateClick.day === date.day &&
      dateClick.month === date.month &&
      dateClick.year === date.year
    ) {
      setDateClick(undefined);
    } else {
      setDateClick(date);
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-3 w-full h-full gap-4 box-border overflow-hidden">
      {/* Calendar */}
      <div className="col-span-2 shadow-sm h-full bg-white rounded-2xl overflow-hidden border border-gray-100">
        <CalendarComponents
          events={events} // ✅ langsung dari redux (sudah include holiday)
          onDateClick={onDateClick}
          onMonthChange={handleMonthChange}
          selectedDate={dateClick}
        />
      </div>

      {/* Event List */}
      <div className="w-full shadow-sm px-6 py-6 bg-white rounded-2xl h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="flex flex-col gap-8">
          {filteredEvents.map((ev) => (
            <div key={ev.date} className="flex flex-col gap-3">
              <p className="text-[13px] font-medium text-gray-500 pl-1">
                {ev.day}, {ev.date}
              </p>

              <div className="flex flex-col gap-3">
                {ev.items.map((item) => (
                  <div
                    key={item.id}
                    className={`${
                      colorMap[item.type] || colorMap.gray
                    } p-4 rounded-2xl border flex flex-col gap-1.5 transition-all hover:shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-[15px] leading-tight pr-4">
                        {item.name}
                      </p>
                      <p className="text-[11px] whitespace-nowrap opacity-60 font-medium">
                        {ev.date}
                      </p>
                    </div>

                    {item.times && (
                      <div className="flex items-center gap-1 opacity-50 text-[11px] font-medium uppercase tracking-wider">
                        <span>{item.times.start}</span>
                        <span>-</span>
                        <span>{item.times.end}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <p className="text-sm font-medium">Tidak ada kegiatan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
