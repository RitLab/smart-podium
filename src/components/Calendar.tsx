import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateClick, EventGroup, EventItem } from "@/types/event.types";

type CalendarCell = {
  day: number;
  currentMonth: boolean;
};

type CalendarComponentsProps = {
  events: EventGroup[];
  onDateClick?: (date: DateClick) => void;
};

const CalendarComponents: React.FC<CalendarComponentsProps> = ({
  events,
  onDateClick,
}) => {
  const MONTH_NAME = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const eventMap: Record<string, EventItem[]> = {};
  events.forEach((ev) => {
    const [day, monthName, year] = ev.date.split(" ");
    const monthIndex = MONTH_NAME.indexOf(monthName) + 1;
    const key = `${year}-${monthIndex}-${day}`;

    eventMap[key] = ev.items;
  });

  const dayList: string[] = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  const [monthData, setMonthData] = useState<{
    year: number | null;
    month: number | null;
    monthName: string;
    calendar: CalendarCell[];
  }>({
    year: null,
    month: null,
    monthName: "",
    calendar: [],
  });

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let firstDay = new Date(year, month, 1).getDay();
    if (firstDay === 0) firstDay = 7;

    const cells = [];

    // date prev month
    for (let i = firstDay - 2; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
      });
    }

    // date this month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        currentMonth: true,
      });
    }

    // date next month
    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({
        day: nextDay++,
        currentMonth: false,
      });
    }

    setMonthData({
      year,
      month: month + 1,
      monthName: MONTH_NAME[month],
      calendar: cells,
    });
  };

  useEffect(() => {
    generateCalendar(new Date());
  }, []);

  const goToPrevMonth = () => {
    if (!monthData.year || !monthData.month) return;
    const prev = new Date(monthData.year, monthData.month - 2, 1);
    generateCalendar(prev);
  };

  const goToNextMonth = () => {
    if (!monthData.year || !monthData.month) return;
    const next = new Date(monthData.year, monthData.month, 1);
    generateCalendar(next);
  };

  return (
    <div className="w-full text-white bg-white rounded-md border-0">
      {/* header */}
      <div className="flex bg-blue-800 gap-4 justify-center py-4 font-semibold text-sm rounded-t-md items-center">
        <button
          className="border rounded-full text-center p-1"
          onClick={goToPrevMonth}
        >
          <ChevronLeft size={12} />
        </button>
        <div>
          {monthData.monthName} {monthData.year}
        </div>
        <button
          className="border rounded-full text-center p-1"
          onClick={goToNextMonth}
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* day list */}
      <div className="grid grid-cols-7 w-full bg-blue-800">
        {dayList.map((day) => {
          return <div className="p-2 text-center text-sm">{day}</div>;
        })}
      </div>

      {/* calendary date */}
      <div className="text-blue-600 grid grid-cols-7 w-full">
        {monthData.calendar.map((cell, idx) => (
          <div
            className={`${cell.currentMonth ? "" : "text-gray-500"} ${
              idx === 35 ? "rounded-bl-md" : ""
            } ${
              idx === 41 ? "rounded-br-md" : ""
            } bg-white h-20 border cursor-pointer border-gray-100 text-sm relative p-1 hover:bg-blue-300 hover:text-white hover:border-blue-600`}
            key={idx}
            onClick={() => {
              if (cell.currentMonth && monthData.year && monthData.month) {
                onDateClick?.({
                  year: monthData.year,
                  month: monthData.month,
                  day: cell.day,
                });
              }
            }}
          >
            {cell.day && (
              <>
                <div className="font-semibold">{cell.day}</div>
                {cell.currentMonth && monthData.year && monthData.month && (
                  <>
                    {eventMap[
                      `${monthData.year}-${monthData.month}-${cell.day}`
                    ]?.map((item) => (
                      <div
                        key={item.id}
                        className={`mt-1 text-xs rounded px-1 block ${
                          item.type === "red"
                            ? "bg-red-200 text-red-800"
                            : item.type === "yellow"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-blue-200 text-blue-200"
                        }`}
                      >
                        {item.name}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarComponents;
