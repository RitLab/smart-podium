import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateClick, EventGroup, EventItem } from "@/types/event";

type CalendarCell = {
  day: number;
  currentMonth: boolean;
};

type CalendarComponentsProps = {
  events: EventGroup[];
  onDateClick?: (date: DateClick) => void;
  onMonthChange?: (month: number, year: number) => void;
  selectedDate?: {
    year: number;
    month: number;
    day: number;
  };
};

const CalendarComponents: React.FC<CalendarComponentsProps> = ({
  events,
  onDateClick,
  onMonthChange,
  selectedDate,
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

    onMonthChange?.(month + 1, year);
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
    <div className="w-full h-full bg-white rounded-md flex flex-col overflow-hidden text-white shadow-sm border border-gray-100">
      {/* header */}
      <div className="flex bg-blue-800 gap-4 justify-center py-3 font-semibold text-sm rounded-t-md items-center">
        <button
          className="border border-white/30 rounded-full text-center p-1 hover:bg-white/10 transition"
          onClick={goToPrevMonth}
        >
          <ChevronLeft size={10} />
        </button>
        <div className="min-w-[120px] text-center">
          {monthData.monthName} {monthData.year}
        </div>
        <button
          className="border border-white/30 rounded-full text-center p-1 hover:bg-white/10 transition"
          onClick={goToNextMonth}
        >
          <ChevronRight size={10} />
        </button>
      </div>

      {/* day list */}
      <div className="grid grid-cols-7 bg-blue-800 shrink-0 border-t border-white/10">
        {dayList.map((day, i) => {
          return (
            <div
              // className="py-1.5 text-center text-[10px] uppercase tracking-wider opacity-80"
              className={`text-center py-1.5 ${i === 6 ? "text-red-300" : ""}`}
              key={day}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* calendary date */}
      <div className="text-blue-600 grid grid-cols-7 grid-rows-6 w-full flex-1">
        {monthData.calendar.map((cell, idx) => {
          const isSunday = idx % 7 === 6;

          const isSelected =
            selectedDate &&
            selectedDate.day === cell.day &&
            selectedDate.month === monthData.month &&
            selectedDate.year === monthData.year &&
            cell.currentMonth;

          const key = `${monthData.year}-${monthData.month}-${cell.day}`;
          const items = eventMap[key] || [];

          // 🔥 detect hari libur nasional
          const holidayItems = items.filter((i) => i.type === "red");
          const isHoliday = holidayItems.length > 0;

          return (
            <div
              className={`${cell.currentMonth ? "" : "text-gray-500"} ${
                idx === 35 ? "rounded-bl-md" : ""
              } ${idx === 41 ? "rounded-br-md" : ""} ${
                isSelected
                  ? "bg-blue-500 text-white border-blue-600 z-10"
                  : "bg-white border-gray-100 hover:bg-blue-50 hover:text-blue-600"
              } border cursor-pointer text-sm relative p-1 transition-colors`}
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
                  <div className="px-2">
                    {/* <div className="font-semibold">{cell.day}</div> */}
                    <div
                      className={`font-semibold ${
                        !isSelected &&
                        cell.currentMonth &&
                        (isSunday || isHoliday)
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      {cell.day}
                    </div>
                    {cell.currentMonth && monthData.year && monthData.month && (
                      <>
                        {/* {eventMap[
                      `${monthData.year}-${monthData.month}-${cell.day}`
                    ]?.map((item) => (
                      <div
                        key={item.id}
                        className={`mt-1 text-xs rounded px-1 block ${
                          item.type === "red"
                            ? "bg-red-200 text-red-800"
                            : item.type === "yellow"
                            ? "bg-yellow-200 text-yellow-800"
                            : item.type === "grey"
                            ? "bg-gray-300 text-black"
                            : "bg-blue-200 text-blue-800"
                        }`}
                      >
                        {item.name}
                      </div>
                    ))} */}
                        {(() => {
                          const items =
                            eventMap[
                              `${monthData.year}-${monthData.month}-${cell.day}`
                            ] || [];

                          const MAX_VISIBLE = 2;
                          const visibleItems = items.slice(0, MAX_VISIBLE);
                          const remainingCount = items.length - MAX_VISIBLE;

                          return (
                            <>
                              {visibleItems.map((item) => (
                                <div
                                  key={item.id}
                                  className={`mt-1.5 text-[10px] font-bold leading-tight rounded-full px-3 py-1 w-[90%] mx-auto text-center ${
                                    item.type === "red"
                                      ? "bg-red-100 text-red-600"
                                      : item.type === "blue"
                                        ? "bg-blue-100 text-blue-600"
                                        : item.type === "orange"
                                          ? "bg-orange-100 text-orange-600"
                                          : item.type === "green"
                                            ? "bg-green-100 text-green-600"
                                            : item.type === "purple"
                                              ? "bg-purple-100 text-purple-600"
                                              : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  <span className="truncate block">
                                    {item.name}
                                  </span>
                                </div>
                              ))}

                              {remainingCount > 0 && (
                                <div className="mt-0.5 text-[8px] text-gray-400 font-medium pl-1 italic">
                                  +{remainingCount} lainnya
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarComponents;
