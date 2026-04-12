import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Pagination from "@/components/Pagination";
import type { Attendance, HandlingStatus, TeacherType } from "@/types/student";
import { fetchAttendance } from "@/stores/student";
import type { AppDispatch, RootState } from "@/stores";
import ItemStudent from "./Item";
import Detail from "./Detail";

const attendanceOptions: HandlingStatus[] = [
  { value: 1, label: "Hadir", variant: "success" },
  { value: 2, label: "Izin", variant: "warning" },
  { value: 3, label: "Tidak Hadir", variant: "error" },
];

const Student = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { attendanceList, teacher, loading } = useSelector(
    (state: RootState) => state.student,
  );
  const [attendance, setAttendance] = useState<Attendance>({} as Attendance);

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const { rawEvents } = useSelector((state: RootState) => state.calendar);

  /* ================= ACTIVE EVENT ID LOGIC ================= */
  const activeEventId = useMemo(() => {
    if (!rawEvents || rawEvents.length === 0) return null;
    
    const now = new Date();
    const todayStr = now.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
    const currentTimeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit", hour12: false
    }).replace(".", ":");

    const todayEvents = rawEvents.filter(ev => ev.event_date === todayStr);
    
    // Cari yang sedang jalan sekarang
    let current = todayEvents.find(ev => 
      ev.start_time <= currentTimeStr && ev.end_time > currentTimeStr
    );

    // Kalau nggak ada yang jalan, cari yang paling deket nanti
    if (!current) {
      current = todayEvents
        .filter(ev => ev.start_time > currentTimeStr)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    }

    return current?.id || null;
  }, [rawEvents]);

  useEffect(() => {
    if (activeEventId) {
      fetchData(activeEventId);
    }
  }, [activeEventId]);

  const [error, setErrorLocal] = useState<string | null>(null);

  const fetchData = async (event_id: string | null) => {
    if (!event_id) return;
    try {
      setErrorLocal(null);

      const res = await dispatch(fetchAttendance(event_id ? { event_id } : null)).unwrap();

      const attendances = res.data.attendances;

      if (attendances.length > 0) {
        setAttendance(attendances[0]);
        setPerPage(10);
        setPage(1);
        setTotalPage(Math.ceil(attendances.length / 10));
      }
    } catch (err: any) {
      setErrorLocal(err);
    }
  };

  // const fetchData = async (event_id: string) => {
  //   await dispatch(fetchAttendance({ event_id })).unwrap();

  //   console.log('attendanceList: ', attendanceList)

  //   if (attendanceList && attendanceList.length > 0) {
  //     setAttendance(attendanceList[0]);
  //     setPerPage(10);
  //     setPage(1);
  //     setTotalPage(Math.ceil(attendanceList.length / perPage));
  //   }
  // };

  const filterAttendanceList = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return attendanceList.slice(startIndex, endIndex);
  }, [attendanceList, page]);

  const handelSetAttendance = (value: Attendance) => {
    if (value === attendance) {
      setAttendance({} as Attendance);
    } else {
      setAttendance(value);
    }
  };

  const handleStatus = (value: number): HandlingStatus => {
    const data = attendanceOptions.find((x) => x.value === value) || {
      value: 0,
      label: "",
      variant: "neutral",
    };
    return data;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md shadow-sm">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Waduh, Ada Kendala!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => activeEventId && fetchData(activeEventId)}
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (attendanceList.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <p className="text-xl font-medium text-gray-400">Data siswa tidak ditemukan untuk jadwal ini.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex gap-12">
      <div
        className={
          (Object.keys(attendance).length === 0 ? "w-full" : "w-4/5") +
          " transition-all"
        }
      >
        <div className="grid grid-cols-5 grid-rows-2 gap-6">
          {filterAttendanceList?.map((item) => (
            <ItemStudent
              key={item.user_id}
              attendance={item}
              setAttendance={(value) => handelSetAttendance(value)}
              handleStatus={handleStatus}
              selectedAttendance={attendance}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Pagination
            currentPage={page}
            totalPages={totalPage}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>
      <div
        className={
          (Object.keys(attendance).length === 0 ? "hidden" : "w-1/5") +
          " transition-all"
        }
      >
        <Detail
          attendance={attendance}
          attendanceOptions={attendanceOptions}
          teacher={teacher}
          handleDone={() => fetchData(activeEventId)}
        />
      </div>
    </div>
  );
};

export default Student;
