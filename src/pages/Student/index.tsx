import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Pagination from "@/components/Pagination";
import type { Attendance, HandlingStatus, TeacherType } from "@/types/student";
import { CLASS_NOT_STARTED, clearAttendance, fetchAttendance } from "@/stores/student";
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
  const { hasStoppedSession, stoppedAt } = useSelector((state: RootState) => state.record);
  const [attendance, setAttendance] = useState<Attendance>({} as Attendance);
  const [graceCountdown, setGraceCountdown] = useState<string | null>(null);

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const { headerEvents } = useSelector((state: RootState) => state.calendar);

  /* ================= ACTIVE EVENT LOGIC ================= */
  // Halaman ini dulu ngebuang SEMUA meeting dari kandidat, lalu jatuh ke
  // prioritas berikutnya. Akibatnya pas meeting lagi jalan, layar nampilin
  // siswa dari kelas lain yang udah bubar — guru ngira itu data lama padahal
  // itu event yang salah. Sekarang meeting ikut dihitung sebagai "yang lagi
  // jalan", biar halaman ini nggak pernah beda pendapat sama navbar.
  const activeEvent = useMemo(() => {
    if (!headerEvents || headerEvents.length === 0) return null;

    const now = new Date();
    const todayStr = now.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
    const currentTimeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit", hour12: false
    }).replace(".", ":");

    const todayEvents = headerEvents.filter(ev => ev.event_date === todayStr);

    // 1. Yang benar-benar jalan sekarang, meeting ikut. Kalau meeting overlap
    //    sama kelas belajar, kelas yang menang — sama persis kayak MainLayout.
    const running = todayEvents.filter(
      ev => ev.start_time <= currentTimeStr && ev.end_time > currentTimeStr
    );
    const current = running.find(ev => !ev.is_meeting) || running[0];
    if (current) return current;

    // 2. Nggak ada yang jalan: mundur ke kelas terakhir selesai, supaya guru
    //    masih bisa ngisi presensi pas jeda antar kelas.
    const selesai = todayEvents
      .filter(ev => !ev.is_meeting && ev.end_time <= currentTimeStr)
      .sort((a, b) => b.end_time.localeCompare(a.end_time));
    if (selesai.length > 0) return selesai[0];

    // 3. Belum ada kelas sama sekali hari ini: lihat yang akan datang.
    return todayEvents
      .filter(ev => !ev.is_meeting && ev.start_time > currentTimeStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))[0] || null;
  }, [headerEvents]);

  const activeEventId = activeEvent?.id || null;
  const meetingBerlangsung = !!activeEvent?.is_meeting;

  useEffect(() => {
    // Meeting nggak punya kelas maupun siswa. Jangan di-fetch, dan yang lebih
    // penting jangan mundur ke event lain — itu yang bikin daftar siswa asing
    // muncul di tengah meeting.
    if (meetingBerlangsung) {
      dispatch(clearAttendance());
      resetAttendanceView();
      setBelumMulai(false);
      return;
    }

    if (activeEventId) {
      fetchData(activeEventId);
      return;
    }

    // Nggak ada jadwal yang cocok hari ini. Tanpa ini daftar siswa dari event
    // sebelumnya nempel terus, soalnya store student nggak pernah ditimpa kalau
    // fetch-nya nggak jalan. Podium nyala berhari-hari, jadi sisa data itu bisa
    // kebawa sampai sesi yang sama sekali beda.
    dispatch(clearAttendance());
    resetAttendanceView();
    setBelumMulai(false);
  }, [activeEventId, meetingBerlangsung, dispatch]);

  const [error, setErrorLocal] = useState<string | null>(null);
  const [belumMulai, setBelumMulai] = useState(false);

  const resetAttendanceView = () => {
    setAttendance({} as Attendance);
    setPerPage(10);
    setPage(1);
    setTotalPage(1);
  };

  const fetchData = async (event_id: string | null) => {
    if (!event_id) return;
    try {
      setErrorLocal(null);
      setBelumMulai(false);

      const res = await dispatch(fetchAttendance({ event_id })).unwrap();

      const attendances = res.data?.attendances ?? [];

      // Reset tetep jalan walaupun list-nya kosong. Dulu ini cuma dijalanin pas
      // ada isi, jadi pagination sama panel detail siswa dari event sebelumnya
      // masih ketinggalan di layar.
      resetAttendanceView();

      if (attendances.length > 0) {
        setAttendance(attendances[0]);
        setTotalPage(Math.ceil(attendances.length / 10));
      }
    } catch (err: any) {
      resetAttendanceView();
      if (err === CLASS_NOT_STARTED) {
        setBelumMulai(true);
        return;
      }
      setErrorLocal(err);
    }
  };

  /* ================= GRACE PERIOD COUNTDOWN ================= */
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      if (hasStoppedSession && stoppedAt) {
        const graceEnd = stoppedAt + 15 * 60 * 1000;
        const diff = graceEnd - now;

        if (diff > 0) {
          const mm = Math.floor(diff / 1000 / 60);
          const ss = Math.floor((diff / 1000) % 60);
          setGraceCountdown(`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`);
        } else {
          setGraceCountdown(null);
        }
      } else {
        setGraceCountdown(null);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [hasStoppedSession, stoppedAt]);

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

  if (meetingBerlangsung && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-xl font-medium text-gray-500">Sedang berlangsung meeting</p>
        <p className="text-sm text-gray-400 mt-2">
          Meeting tidak memiliki daftar presensi siswa.
        </p>
      </div>
    );
  }

  if (belumMulai && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-xl font-medium text-gray-500">Kelas belum dimulai</p>
        <p className="text-sm text-gray-400 mt-2">
          Presensi bisa diisi setelah kelas berjalan.
        </p>
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
    <div className="w-full flex flex-col gap-4">
      {graceCountdown && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3 text-orange-700">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">Waktu Jeda Tersisa</p>
              <p className="text-xs opacity-80">Selesaikan presensi sebelum waktu habis</p>
            </div>
          </div>
          <div className="text-3xl font-black text-orange-600 tabular-nums tracking-tighter">
            {graceCountdown}
          </div>
        </div>
      )}

      <div className="flex gap-12">
        <div
          className={
            (Object.keys(attendance).length === 0 ? "w-full" : "w-4/5") +
            " transition-all"
          }
        >
        <div className="grid grid-cols-5 grid-rows-2 gap-4">
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

        <div className="mt-4 flex justify-end">
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
          eventId={activeEventId}
        />
      </div>
    </div>
  </div>
  );
};

export default Student;
