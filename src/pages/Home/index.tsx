import { useEffect, useRef, useState } from "react"; // Home Page Component
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import Logo from "@/assets/images/logo.png";
import {
  BookIcon,
  CalendarIcon,
  UsersIcon,
  WebIcon,
  WhiteboardIcon,
  ZoomIcon
} from "@/components/Icon";
import { Image } from "@/components/Image";

import { formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth";
import { fetchEventList } from "@/stores/calendar";
import { startRecord, stopRecord, clearError, resetRecord, setShowSummary, setShowStopConfirm, setFinishedEvent } from "@/stores/record";

import { useToast } from "@/components/ToastProvider";
import PINModal from "@/components/PINModal";

/* ================= MENU TYPE ================= */

type MenuAccess = "always" | "lesson_plus_15" | "lesson_only" | "outside_only";

type MenuItem = {
  label: string;
  icon?: any;
  image?: string;
  color: keyof typeof colorMap;
  path?: string;
  action?: "whiteboard" | "minimize" | "zoom" | "wondercast";
  access: MenuAccess;
};

/* ================= MENU LIST ================= */

const menus: MenuItem[] = [
  {
    path: "/calendar",
    label: "Kalender Akademik",
    icon: CalendarIcon,
    color: "blue",
    access: "always",
  },
  {
    path: "/student",
    label: "Manajemen Peserta Didik",
    icon: UsersIcon,
    color: "green",
    access: "lesson_plus_15",
  },
  {
    path: "/module",
    label: "Materi Pelajaran",
    icon: BookIcon,
    color: "yellow",
    access: "lesson_plus_15",
  },
  {
    path: "/internet",
    label: "Penampil Web",
    icon: WebIcon,
    color: "red",
    access: "lesson_only",
  },
  {
    action: "whiteboard",
    label: "Whiteboard",
    icon: WhiteboardIcon,
    color: "green",
    access: "lesson_only",
  },
  {
    action: "zoom",
    label: "Zoom",
    icon: ZoomIcon,
    color: "blue",
    access: "lesson_only",
  },
  // WonderCast dihapus karena menyebabkan hang
];

/* ================= COLOR MAP ================= */

const colorMap = {
  blue: "from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-800",
  green: "from-green-500 to-green-600 hover:from-green-700 hover:to-green-800",
  yellow:
    "from-yellow-500 to-yellow-600 hover:from-yellow-700 hover:to-yellow-800",
  red: "from-red-500 to-red-600 hover:from-red-700 hover:to-red-800",
};

/* ================= MENU CARD ================= */

type MenuCardProps = {
  Icon: any;
  menu: MenuItem;
};

const MenuCard = ({ Icon, menu }: MenuCardProps) => (
  <div className="flex flex-col items-center hover:scale-105">
    <div
      className={`h-24 w-24 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-b ${colorMap[menu.color]
        }`}
    >
      <Icon width={58} height={58} className="text-white" />
    </div>
    <p className="mt-4 text-gray-700 font-medium">{menu.label}</p>
  </div>
);

/* ================= COMPONENT ================= */

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const { rawEvents } = useSelector((state: RootState) => state.calendar);
  const { isRecording, session_id, error, hasStoppedSession, stoppedAt, finishedEvent } = useSelector(
    (state: RootState) => state.record,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [time, setTime] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [showPIN, setShowPIN] = useState(false);

  /* ================= ACCESS STATE ================= */
  // isLessonActive  : pelajaran sedang berjalan (exact)
  // isLessonOrGrace : pelajaran berjalan ATAU dalam 15 menit setelah selesai
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isLessonOrGrace, setIsLessonOrGrace] = useState(false);

  /* ================= FETCH EVENTS ================= */

  useEffect(() => {
    const fetchData = () => {
      const now = new Date();
      dispatch(
        fetchEventList({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      );
    };

    fetchData();

    // Refetch every 5 seconds to keep the schedule updated (Real-time feel)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  /* ================= FIND NEXT EVENT ================= */

  useEffect(() => {
    if (!rawEvents || rawEvents.length === 0) return;

    const now = new Date();

    const todayStr = now.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });

    const currentTimeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit", hour12: false
    }).replace(".", ":");

    const todayEvents = rawEvents.filter(ev => {
      if (ev.event_date !== todayStr) return false;
      // Exclude finishedEvent saat user memilih Keluar (hasStoppedSession=false tapi finishedEvent ada)
      if (finishedEvent && String(ev.id) === String(finishedEvent.id) && !hasStoppedSession) return false;
      return true;
    });

    if (todayEvents.length === 0) {
      setActiveEvent(null);
      return;
    }

    // Prioritas 0: Jika baru stop dan masih dalam grace period (Periksa Absensi), tetap tampilkan event yang baru selesai
    if (hasStoppedSession && finishedEvent) {
      setActiveEvent(finishedEvent);
      return;
    }

    // 1. Cari yang sedang jalan sekarang
    let current = todayEvents.find(ev =>
      ev.start_time <= currentTimeStr && ev.end_time > currentTimeStr
    );

    // 2. Jika tidak ada yang sedang jalan, cari yang akan datang (upcoming)
    if (!current) {
      current = todayEvents
        .filter(ev => ev.start_time > currentTimeStr)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    }

    // Jika tidak ada yang sedang jalan dan tidak ada upcoming → semua selesai, kosongkan
    setActiveEvent(current || null);
  }, [rawEvents, time, finishedEvent, hasStoppedSession]);

  /* ================= UPDATE LISTENER ================= */

  useEffect(() => {
    const handleUpdateStatus = (_event: any, status: string) => {
      showToast(status, "info");
    };

    window.ipcRenderer.on("update-status", handleUpdateStatus);
    return () => {
      window.ipcRenderer.off("update-status", handleUpdateStatus);
    };
  }, [showToast]);

  const [countdown, setCountdown] = useState<string | null>(null);
  const [graceCountdown, setGraceCountdown] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);


  /* ================= DEBUG LOGIC ================= */

  const clickCountRef = useRef(0);
  const versionClickCountRef = useRef(0);
  const clockClickCountRef = useRef(0);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 5) {
      clickCountRef.current = 0;
      navigate("/lock-screen");
    }
    setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  };

  const isExitDialogOpeningRef = useRef(false);

  const handleVersionClick = () => {
    if (isExitDialogOpeningRef.current) return;

    versionClickCountRef.current += 1;
    if (versionClickCountRef.current === 5) {
      versionClickCountRef.current = 0;
      isExitDialogOpeningRef.current = true;

      window.ipcRenderer.invoke("show-quit-dialog").finally(() => {
        isExitDialogOpeningRef.current = false;
      });
    }
    setTimeout(() => {
      versionClickCountRef.current = 0;
    }, 2000);
  };

  const isUpdateCheckingRef = useRef(false);

  const handleClockClick = () => {
    if (isUpdateCheckingRef.current) return;

    clockClickCountRef.current += 1;
    if (clockClickCountRef.current === 5) {
      clockClickCountRef.current = 0;
      isUpdateCheckingRef.current = true;

      window.ipcRenderer.invoke("check-update");
      showToast("Mengecek pembaruan sistem...", "info");

      setTimeout(() => {
        isUpdateCheckingRef.current = false;
      }, 10000);
    }
    setTimeout(() => {
      clockClickCountRef.current = 0;
    }, 2000);
  };

  /* ================= WHITEBOARD ================= */

  const openWhiteboard = () => {
    window.ipcRenderer.invoke("open-whiteboard");
  };

  const openZoom = () => {
    window.ipcRenderer.invoke("open-zoom");
  };


  /* ================= ERROR TOAST ================= */
  // Moved to MainLayout for centralized handling


  /* ================= HELPER TIME ================= */

  const getTimeToday = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  /* ================= COUNTDOWN + ACCESS STATE ================= */

  useEffect(() => {
    const update = () => {
      const now = Date.now();

      // Grace Countdown (15 min after stop) - Pindahkan ke atas agar tetap jalan meski activeEvent null
      if (hasStoppedSession && stoppedAt) {
        const graceEndLocal = stoppedAt + 15 * 60 * 1000;
        const diff = graceEndLocal - now;
        if (diff > 0) {
          const totalSec = Math.floor(diff / 1000);
          const mm = Math.floor(totalSec / 60);
          const ss = totalSec % 60;
          setGraceCountdown(`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`);
        } else {
          setGraceCountdown(null);
        }
      } else {
        setGraceCountdown(null);
      }

      if (!activeEvent?.start_time) {
        setIsStarted(false);
        setCountdown(null);
        setIsLessonActive(false);
        setIsLessonOrGrace(false);
        return;
      }

      const startTime = getTimeToday(activeEvent.start_time);
      const endTime = getTimeToday(activeEvent.end_time);
      const graceEnd = endTime + 15 * 60 * 1000; // +15 menit grace period

      const startThreshold = startTime - 15 * 60 * 1000; // 15 minutes before start

      const lessonActive = now >= startTime && now < endTime;
      const lessonOrGrace = now >= startTime && now < graceEnd;
      const isUpcomingSoon = now >= startThreshold && now < startTime;

      setIsLessonActive(lessonActive);
      setIsLessonOrGrace(lessonOrGrace);

      if (lessonActive) {
        setIsStarted(true);
        setCountdown(null);
      } else if (now < startTime) {
        setIsStarted(isUpcomingSoon);
        const diff = startTime - now;
        const totalSeconds = Math.floor(diff / 1000);
        const minutes = Math.floor((totalSeconds / 60) % 60);
        const hours = Math.floor(totalSeconds / 3600);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
          setCountdown(
            `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
          );
        } else {
          setCountdown(
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
          );
        }
      } else {
        // Pelajaran selesai — tapi grace period mungkin masih aktif
        setIsStarted(false);
        setCountdown(null);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeEvent, hasStoppedSession, stoppedAt]);



  /* ================= REALTIME CLOCK ================= */

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= FETCH USER ================= */

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  /* ================= START / STOP RECORD ================= */

  const handleRecordToggle = async () => {
    if (!activeEvent) {
      showToast("Gagal: Tidak ada jadwal aktif", "error");
      return;
    }

    if (!isRecording) {
      // START - Tampilkan verifikasi PIN dulu
      setShowPIN(true);
    } else {
      // STOP — selalu tampilkan konfirmasi via Redux (MainLayout handles modal)
      dispatch(setShowStopConfirm(true));
    }
  };

  const onPINSuccess = async () => {
    setShowPIN(false);
    if (!activeEvent) return;

    try {
      await dispatch(startRecord({ id: String(activeEvent.id) })).unwrap();
      showToast("Sesi belajar dimulai", "success");
      navigate("/module");
    } catch (err: any) {
      console.error("Start record error:", err);
      showToast(err || "Gagal memulai sesi belajar", "error");
    }
  };





  /* ================= ACCESS RESOLVER ================= */
  // lesson_only juga disable jika session sudah dihentikan
  const isMenuEnabled = (access: MenuAccess): boolean => {
    if (isRecording) {
      return access !== "outside_only";
    }

    if (hasStoppedSession && stoppedAt) {
      const graceEndLocal = stoppedAt + 15 * 60 * 1000;
      const isWithinGrace = Date.now() < graceEndLocal;

      if (access === "always") return true;
      if (access === "lesson_plus_15") return isWithinGrace;
      return false;
    }

    return access === "always";
  };

  /* ================= RENDER ================= */

  return (
    <div className="relative h-full flex flex-col items-center justify-center gap-12 py-12">
      <div>
        <p
          className="text-xs text-gray-400 text-center mb-2 cursor-pointer select-none"
          onClick={handleVersionClick}
        >
          Smart Podium v{__APP_VERSION__}
        </p>

        <div className="flex flex-col gap-16 items-center">
          <img
            src={Logo}
            alt="Logo"
            className="h-18 w-96 object-contain cursor-pointer"
            onClick={handleLogoClick}
          />

          <div className="text-center">
            <h1
              className="text-7xl font-bold text-gray-800 cursor-pointer select-none"
              onClick={handleClockClick}
            >
              {formattedTime(time)}
            </h1>
            <p className="text-2xl text-gray-600 mt-4">{formattedDate(time)}</p>
          </div>

          <div className="flex items-center gap-6 justify-between p-6 rounded-2xl shadow-lg bg-white border border-gray-100 min-w-[550px] max-w-[650px]">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <Image
                src={activeEvent?.teacher_image}
                alt={activeEvent?.teacher_name}
                className="h-20 w-20 rounded-full border-2 border-gray-50 shrink-0"
              />

              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-2xl font-bold text-gray-800 truncate">
                  {activeEvent?.teacher_name || "Tidak ada jadwal"}
                </h3>
                <p className="text-sm text-gray-500 leading-snug break-words">
                  {activeEvent?.course_name
                    ? <span className="font-semibold text-blue-600">{activeEvent.course_name}</span>
                    : "Silakan cek kalender untuk jadwal lainnya"}
                </p>
                {activeEvent?.class_room_name && (
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
                    {activeEvent.class_room_name}
                  </p>
                )}
              </div>
            </div>

            {/* Tombol Mulai / Stop / Countdown */}
            {hasStoppedSession ? (
              // Sesi sudah selesai — tampilkan countdown grace period jika ada
              <div className="flex flex-col items-center gap-1 px-4 py-2 text-center min-w-[120px]">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  {graceCountdown ? "Waktu Jeda" : "Sesi Selesai"}
                </div>
                {graceCountdown ? (
                  <div className="text-xl font-bold text-orange-500 tabular-nums">
                    {graceCountdown}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-300">Tunggu jadwal berikutnya</div>
                )}

                {/* TOMBOL RESET KHUSUS DEBUG */}
                <button
                  onClick={() => dispatch(resetRecord())}
                  className="mt-2 text-[9px] text-blue-500 hover:text-blue-700 underline cursor-pointer active:scale-95 transition-all"
                >
                  (Debug: Reset State)
                </button>
              </div>
            ) : isRecording ? (
              <button
                onClick={handleRecordToggle}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition text-white cursor-pointer active:scale-95 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
              >
                <LogOut size={18} />
                <div>Stop</div>
              </button>
            ) : isLessonActive ? (
              <button
                onClick={handleRecordToggle}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition text-white cursor-pointer active:scale-95 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 animate-pulse ring-4 ring-emerald-500/50"
              >
                <LogOut size={18} />
                <div>Mulai</div>
              </button>
            ) : (
              <button
                disabled
                className="flex flex-col items-center gap-1 bg-gradient-to-b from-[#FFC35C] to-[#FCA106] text-white px-4 py-2 rounded-lg font-medium text-sm opacity-80 cursor-not-allowed"
              >
                <div className="text-sm">Mulai Dalam</div>
                <div className="text-xl font-semibold">
                  {countdown ?? "--:--"}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>



      {/* MAIN MENUS */}
      <div className="grid grid-cols-6 gap-x-12 gap-y-8 text-center max-w-6xl">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const enabled = isMenuEnabled(menu.access);

          const renderMenuInner = (
            <div key={menu.label} className={`group flex flex-col items-center transition-all duration-300 ${enabled ? "" : "opacity-35 grayscale pointer-events-none"
              }`}>
              <div
                className={`h-24 w-24 rounded-[2rem] flex items-center justify-center shadow-xl shadow-gray-200 overflow-hidden transition-all duration-300 ${enabled
                  ? "group-hover:scale-110 group-hover:-translate-y-2 group-active:scale-95"
                  : ""
                  } ${menu.image ? "" : `bg-gradient-to-b ${colorMap[menu.color]}`
                  }`}
              >
                {menu.image ? (
                  <img src={menu.image} alt={menu.label} className="w-full h-full object-cover" />
                ) : (
                  <Icon width={52} height={52} className="text-white drop-shadow-md" />
                )}
              </div>
              <p className={`mt-4 text-sm font-bold tracking-tight transition-all ${enabled
                ? "text-gray-700 opacity-90 group-hover:opacity-100 group-hover:text-blue-600"
                : "text-gray-400"
                }`}>
                {menu.label}
              </p>
            </div>
          );

          // Disabled → wrapper non-interactive
          if (!enabled) {
            return (
              <div key={menu.label} className="cursor-not-allowed select-none" title="Tidak tersedia di luar jadwal pelajaran">
                {renderMenuInner}
              </div>
            );
          }

          if (menu.action === "whiteboard") {
            return (
              <button key={menu.label} type="button" onClick={openWhiteboard} className="outline-none">
                {renderMenuInner}
              </button>
            );
          }

          if (menu.action === "zoom") {
            return (
              <button key={menu.label} type="button" onClick={openZoom} className="outline-none">
                {renderMenuInner}
              </button>
            );
          }

          // wondercast dihapus

          return (
            <NavLink key={menu.label} to={menu.path || "/"}>
              {renderMenuInner}
            </NavLink>
          );
        })}
      </div>

      {/* PIN Verification Modal */}
      <PINModal
        isOpen={showPIN}
        onClose={() => setShowPIN(false)}
        onSuccess={onPINSuccess}
        teacherId={activeEvent?.teacher_id || ""}
      />
    </div>
  );
};

export default Home;
