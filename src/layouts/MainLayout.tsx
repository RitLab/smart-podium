import { Clock9, LogOut, Minimize, Timer } from "lucide-react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, NavLink, Outlet, useLocation } from "react-router";

import bgImage from "@/assets/images/bg-solid.png";
import Logo from "@/assets/images/logo.png";
import {
  BookIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
  WebIcon,
  WhiteboardIcon,
  ZoomIcon
} from "@/components/Icon";
import { Image } from "@/components/Image";
import Loading from "@/components/Loading";
import { formatDuration, formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth";
import { fetchEventList, fetchHeaderEvents } from "@/stores/calendar";
import { stopRecord } from "@/stores/record";
import { resetStoppedSession } from "@/stores/record";
import { Toast, ToastContextType, ToastType } from "@/types/ui";
import ToastComponent from "@/components/Toast";
import RecorderComponents from "@/components/Recorder";

/* =====================================================
   TOAST CONTEXT
===================================================== */

import { useToast } from "@/components/ToastProvider";

/* =====================================================
   MENUS
===================================================== */

// const menus = [
//   { path: "/calendar", icon: CalendarIcon, color: "blue" },
//   { path: "/student", icon: UsersIcon, color: "green" },
//   { path: "/module", icon: BookIcon, color: "yellow" },
//   { path: "/internet", icon: WebIcon, color: "red" },
//   { path: "/internet", icon: WebIcon, color: "blue" },
// ] as const;

type MenuAccess = "always" | "lesson_plus_15" | "lesson_only";

type MenuItem = {
  label: string;
  icon: any;
  color: keyof typeof colorMap;
  path?: string;
  action?: "whiteboard" | "minimize" | "zoom" | "wondercast";
  access: MenuAccess;
};

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
    action: "zoom" as const,
    label: "Zoom",
    icon: ZoomIcon,
    color: "blue" as const,
    access: "lesson_only",
  },
  // WonderCast dihapus karena menyebabkan hang
];

const colorMap = {
  blue: {
    active: "from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-800",
    inactive: "from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100",
    iconActive: "text-white",
    iconInactive: "text-blue-600",
  },
  green: {
    active:
      "from-green-500 to-green-600 hover:from-green-700 hover:to-green-800",
    inactive: "from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100",
    iconActive: "text-white",
    iconInactive: "text-green-600",
  },
  yellow: {
    active:
      "from-yellow-500 to-yellow-600 hover:from-yellow-700 hover:to-yellow-800",
    inactive:
      "from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-yellow-100",
    iconActive: "text-white",
    iconInactive: "text-yellow-600",
  },
  red: {
    active: "from-red-500 to-red-600 hover:from-red-700 hover:to-red-800",
    inactive: "from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100",
    iconActive: "text-white",
    iconInactive: "text-red-600",
  },
} as const;

/* =====================================================
   NAVBAR
===================================================== */
const Navbar = React.memo(({ time, activeEvent, isStarted, countdown }: any) => {
  return (
    <header className="flex items-center justify-between relative">
      <img src={Logo} alt="Logo" className="h-28 w-96 object-contain" />

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-white shadow-md rounded-md p-4">
          <Image
            src={activeEvent?.teacher_image}
            alt={activeEvent?.teacher_name}
            className="h-14 w-14"
          />
          <div className="mx-3">
            <h3 className="font-semibold text-gray-900">
              {activeEvent?.teacher_name || "Tidak ada jadwal"}
            </h3>
            <p className="text-sm text-gray-600">{activeEvent?.course_name || "Cek kalender"}</p>
          </div>
        </div>

        <div className="flex bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-md shadow-md">
          <div className="p-4 border-r border-white/30">
            <p className="text-sm">{formattedDate(time)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock9 size={16} />
              <span className="text-lg font-bold">{formattedTime(time)}</span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm">{isStarted ? "Sisa Waktu" : "Mulai Dalam"}</p>
            <div className="flex items-center gap-2 mt-1">
              <Timer size={16} />
              <span className="text-lg font-bold">{countdown}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});


// const Navbar = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { eventList } = useSelector(
//     (state: RootState) => state.calendar
//   );

//   const [time, setTime] = useState(new Date());
//   const [studySeconds, setStudySeconds] = useState(0);

//   useEffect(() => {
//     dispatch(fetchUser());
//   }, [dispatch]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(new Date());
//       setStudySeconds((prev) => prev + 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <header className="flex items-center justify-between relative">
//       <img src={Logo} alt="Logo" className="h-28 w-96 object-contain" />

//       <div className="flex items-center gap-6">
//         <div className="flex items-center bg-white shadow-md rounded-md p-4">
//           <Image
//             src={eventList?.teacher_image}
//             alt={eventList?.teacher_name}
//             className="h-14 w-14"
//           />
//           <div className="mx-3">
//             <h3 className="font-semibold text-gray-900">
//               {eventList?.teacher_name}
//             </h3>
//             <p className="text-sm text-gray-600">
//               {eventList?.course_name}
//             </p>
//           </div>
//         </div>

//         <div className="flex bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-md shadow-md">
//           <div className="p-4 border-r border-white/30">
//             <p className="text-sm">{formattedDate(time)}</p>
//             <div className="flex items-center gap-2 mt-1">
//               <Clock9 size={16} />
//               <span className="text-lg font-bold">
//                 {formattedTime(time)}
//               </span>
//             </div>
//           </div>

//           <div className="p-4">
//             <p className="text-sm">Waktu Belajar</p>
//             <div className="flex items-center gap-2 mt-1">
//               <Timer size={16} />
//               <span className="text-lg font-bold">
//                 {formatDuration(studySeconds)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

/* =====================================================
   SIDEBAR
===================================================== */

type SidebarProps = {
  isLessonActive: boolean;
  isLessonOrGrace: boolean;
  hasStoppedSession: boolean;
};

const Sidebar = React.memo(({ isLessonActive, isLessonOrGrace, hasStoppedSession }: SidebarProps) => {
  const location = useLocation();

  /* ================= WHITEBOARD ================= */

  const openWhiteboard = () => {
    window.ipcRenderer.invoke("open-whiteboard");
  };

  const openZoom = () => {
    window.ipcRenderer.invoke('open-zoom');
  };

  /* ================= MINIMIZE ================= */

  const minimizeApp = () => {
    window.ipcRenderer.invoke("minimize-window");
  };

  /* ================= ACCESS RESOLVER ================= */
  // Ketika session sudah di-stop manual, lesson_only harus disable
  const isMenuEnabled = (access: MenuAccess): boolean => {
    switch (access) {
      case "always":         return true;
      case "lesson_plus_15": return isLessonOrGrace;
      case "lesson_only":    return isLessonActive && !hasStoppedSession;
      default:               return false;
    }
  };

  return (
    <aside className="flex flex-col justify-center">
      <div className="w-20 flex flex-col items-center py-6 gap-6 bg-white shadow-lg rounded-l-2xl">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const color = colorMap[menu.color];
          const enabled = isMenuEnabled(menu.access);

          // Disabled wrapper — tampil redup, tidak bisa diklik
          const disabledWrapper = (child: React.ReactNode) => (
            <div
              key={menu.label}
              className="opacity-30 grayscale cursor-not-allowed"
              title="Tidak tersedia di luar jadwal pelajaran"
            >
              {child}
            </div>
          );

          const iconEl = (
            <div
              className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${color.inactive}`}
            >
              <Icon width={24} height={24} className={color.iconInactive} />
            </div>
          );

          if ("action" in menu) {
            if (menu.action === "whiteboard") {
              if (!enabled) return disabledWrapper(iconEl);
              return (
                <button key={menu.label} type="button" onClick={openWhiteboard}>
                  {iconEl}
                </button>
              );
            }

            if (menu.action === "zoom") {
              if (!enabled) return disabledWrapper(iconEl);
              return (
                <button key={menu.label} type="button" onClick={openZoom}>
                  {iconEl}
                </button>
              );
            }

            if (menu.action === "minimize") {
              return (
                <button key={menu.label} type="button" onClick={minimizeApp}>
                  {iconEl}
                </button>
              );
            }
          }

          const isActive = location.pathname === menu.path;
          const activeIconEl = (
            <div
              className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${
                isActive ? color.active : color.inactive
              }`}
            >
              <Icon
                width={24}
                height={24}
                className={isActive ? color.iconActive : color.iconInactive}
              />
            </div>
          );

          if (!enabled) return disabledWrapper(activeIconEl);

          return (
            <NavLink key={menu.path} to={menu.path!}>
              {activeIconEl}
            </NavLink>
          );
        })}

        <div className="mt-20 flex flex-col gap-4 items-center">
          <NavLink to="/home">
            <HomeIcon width={24} height={24} className="text-orange-600" />
          </NavLink>
          <button
            title="Logout / Reset Flow"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </aside>
  );
});

/* =====================================================
   MAIN LAYOUT CORE
===================================================== */

const MainLayoutContent = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  
  const { error, loading, isFullScreen } = useSelector((state: RootState) => state.ui);
  const { isRecording, session_id, hasStoppedSession } = useSelector((state: RootState) => state.record);
  const { headerEvents } = useSelector((state: RootState) => state.calendar);

  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [time, setTime] = useState(new Date());
  const [countdown, setCountdown] = useState("00:00:00");

  // Access control states untuk sidebar
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isLessonOrGrace, setIsLessonOrGrace] = useState(false);

  const hasAutoStoppedRef = useRef(false);

  // 1. Fetch data on mount and interval
  useEffect(() => {
    dispatch(fetchUser());

    const fetchData = () => {
      const now = new Date();
      dispatch(
        fetchHeaderEvents({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      );
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Background refresh every 10s
    return () => clearInterval(interval);
  }, [dispatch]);

  // 2. Update time every second and calculate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);

      if (!activeEvent?.start_time) {
        setCountdown("00:00:00");
        setIsStarted(false);
        setIsLessonActive(false);
        setIsLessonOrGrace(false);
        return;
      }

      const getTimeToday = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d.getTime();
      };

      const startTime = getTimeToday(activeEvent.start_time);
      const endTime = getTimeToday(activeEvent.end_time);
      const graceEnd = endTime + 15 * 60 * 1000;
      const currentTime = now.getTime();

      // Update access control states
      setIsLessonActive(currentTime >= startTime && currentTime < endTime);
      setIsLessonOrGrace(currentTime >= startTime && currentTime < graceEnd);

      let targetTime = 0;
      if (currentTime >= startTime && currentTime < endTime) {
        setIsStarted(true);
        targetTime = endTime;
      } else if (currentTime < startTime) {
        setIsStarted(false);
        targetTime = startTime;
      } else {
        setCountdown("00:00:00");
        setIsStarted(false);
        return;
      }

      const diff = targetTime - currentTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  // 3. Logic cari event
  useEffect(() => {
    if (!headerEvents || headerEvents.length === 0) return;
    const now = new Date();
    const todayStr = now.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
    const currentTimeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit", hour12: false
    }).replace(".", ":");

    const todayEvents = headerEvents.filter(ev => ev.event_date === todayStr);
    
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

    // Jika tidak ada yang jalan dan tidak ada upcoming → semua selesai, kosongkan header
    // Hindari re-render jika event-nya sama (sampe ID-nya sama)
    if (!activeEvent || activeEvent.id !== current?.id) {
       setActiveEvent(current || null);
       // Reset stopped-session flag ketika event baru terdeteksi
       if (current && activeEvent && current.id !== activeEvent?.id) {
         dispatch(resetStoppedSession());
       }
    }
  }, [headerEvents, time, activeEvent]);

  /* ================= ENFORCE START NOTIFICATION ================= */
  useEffect(() => {
    // Jangan tampilkan notifikasi jika sesi sudah dihentikan manual
    if (hasStoppedSession) return;
    if (isStarted && !isRecording) {
      showToast(
        "Kelas telah dimulai, silakan klik tombol Mulai untuk memulai kelas.",
        "info"
      );
      const interval = setInterval(() => {
        showToast(
          "Kelas telah dimulai, silakan klik tombol Mulai untuk memulai kelas.",
          "info"
        );
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isStarted, isRecording, hasStoppedSession, showToast]);

  /* ================= AUTO STOP RECORD ================= */
  useEffect(() => {
    if (!activeEvent?.end_time) return;
    if (!isRecording) {
      hasAutoStoppedRef.current = false;
      return;
    }
    if (!session_id) return;

    const getTimeToday = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d.getTime();
    };

    const endTime = getTimeToday(activeEvent.end_time);

    const interval = setInterval(async () => {
      const now = Date.now();

      if (now >= endTime && !hasAutoStoppedRef.current) {
        hasAutoStoppedRef.current = true;

        try {
          await dispatch(
            stopRecord({
              session_id,
              event_id: String(activeEvent.id),
            }),
          ).unwrap();

          console.log("Recording auto stopped (end time reached)");
        } catch (err) {
          console.error("Auto stop failed:", err);
        }

        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent, isRecording, session_id, dispatch]);

  const clickCountRef = useRef(0);

  const isHome = location.pathname === "/home";
  const isInternet = location.pathname === "/internet";

  const minimizeApp = () => {
    window.ipcRenderer.invoke("minimize-window");
  };

  const handleMinimizeOrClose = () => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 5) {
      clickCountRef.current = 0;
      window.ipcRenderer.invoke("show-quit-dialog");
    } else {
      minimizeApp();
    }

    setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  };


  useEffect(() => {
    if (error) {
      showToast(error, "error");
      // Prevent infinite loops or redundant toasts by clearing if needed
      // dispatch(clearError()); 
    }
  }, [error, showToast]);

  if (isHome) {
    return (
      <div
        className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {!isFullScreen && (
          <div className="absolute top-4 left-24 z-50">
            <RecorderComponents />
          </div>
        )}

        <button
          type="button"
          onClick={handleMinimizeOrClose}
          className="absolute top-0 right-0 w-16 h-16 opacity-0 cursor-default z-50"
        />

        <Outlet />
        {loading && <Loading />}
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {!isFullScreen && (
        <div className="absolute top-4 left-24 z-50">
          <RecorderComponents />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${
          isFullScreen ? "p-0 m-0" : isInternet ? "p-8" : "pt-6 pl-12 pr-12 pb-6"
        }`}
      >
        {!isInternet && !isFullScreen && (
          <Navbar 
            time={time} 
            activeEvent={activeEvent} 
            isStarted={isStarted} 
            countdown={countdown} 
          />
        )}


        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden ${!isInternet && !isFullScreen ? "mt-4" : "m-0"}`}>
          <Outlet />
        </main>
      </div>

      {!isFullScreen && <Sidebar isLessonActive={isLessonActive} isLessonOrGrace={isLessonOrGrace} hasStoppedSession={hasStoppedSession} />}
      {loading && <Loading />}
    </div>
  );
};

/* =====================================================
   MAIN LAYOUT WRAPPER
===================================================== */

const MainLayout = () => {
  const class_id = localStorage.getItem("class_id") || "";
  const pin = localStorage.getItem("pin") || "";
  const token = sessionStorage.getItem("token") || "";

  if (!class_id || !pin) {
    return <Navigate to="/setting-pin" replace />;
  }

  if (!token) {
    return <Navigate to="/lock-screen" replace />;
  }

  return (
    <MainLayoutContent />
  );
};

export default MainLayout;
