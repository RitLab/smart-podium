import { Clock9, LogOut, Minimize, Timer } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
} from "@/components/Icon";
import { Image } from "@/components/Image";
import Loading from "@/components/Loading";
import { formatDuration, formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth";
import { fetchEventList, fetchHeaderEvents } from "@/stores/calendar";
import { Toast, ToastContextType, ToastType } from "@/types/ui";
import ToastComponent from "@/components/Toast";
import RecorderComponents from "@/components/Recorder";

/* =====================================================
   TOAST CONTEXT
===================================================== */

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts([{ id, message, type }]); // Langsung ganti yang lama (biar cuma 1)

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000); // Saya perlama sedikit durasinya biar enak dibaca
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastComponent toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  );
};

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

type MenuItem = {
  label: string;
  icon: any;
  color: keyof typeof colorMap;
  path?: string;
  action?: "whiteboard" | "minimize";
};

const menus: MenuItem[] = [
  {
    path: "/calendar",
    label: "Kalender Akademik",
    icon: CalendarIcon,
    color: "blue",
  },
  {
    path: "/student",
    label: "Manajemen Peserta Didik",
    icon: UsersIcon,
    color: "green",
  },
  {
    path: "/module",
    label: "Materi Pelajaran",
    icon: BookIcon,
    color: "yellow",
  },
  {
    path: "/internet",
    label: "Penampil Web",
    icon: WebIcon,
    color: "red",
  },
  {
    action: "whiteboard",
    label: "Whiteboard",
    icon: WhiteboardIcon,
    color: "blue",
  },
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
const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { headerEvents } = useSelector((state: RootState) => state.calendar);

  const [time, setTime] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    dispatch(fetchUser());
    const now = new Date();
    // Gunakan fetchHeaderEvents biar datanya tetap di bulan ini
    dispatch(fetchHeaderEvents({ 
      month: now.getMonth() + 1, 
      year: now.getFullYear() 
    }));
  }, [dispatch]);

  // Logika cari event (sama dengan Home)
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
    const upcoming = todayEvents
      .filter(ev => ev.start_time > currentTimeStr || (ev.start_time <= currentTimeStr && ev.end_time > currentTimeStr))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    setActiveEvent(upcoming.length > 0 ? upcoming[0] : null);
  }, [headerEvents, time]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);

      if (!activeEvent?.start_time) {
        setCountdown("00:00:00");
        setIsStarted(false);
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
      const currentTime = now.getTime();

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
};

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

const Sidebar = () => {
  const location = useLocation();

  /* ================= WHITEBOARD ================= */

  const openWhiteboard = () => {
    window.ipcRenderer.invoke("open-whiteboard");
  };

  /* ================= MINIMIZE ================= */

  const minimizeApp = () => {
    window.ipcRenderer.invoke("minimize-window");
  };

  return (
    <aside className="flex flex-col justify-center">
      <div className="w-20 flex flex-col items-center py-6 gap-6 bg-white shadow-lg rounded-l-2xl">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const color = colorMap[menu.color];

          if ("action" in menu) {
            if (menu.action === "whiteboard") {
              return (
                <button key={menu.label} type="button" onClick={openWhiteboard}>
                  <div
                    className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${color.inactive}`}
                  >
                    <Icon
                      width={24}
                      height={24}
                      className={color.iconInactive}
                    />
                  </div>
                </button>
              );
            }

            if (menu.action === "minimize") {
              return (
                <button key={menu.label} type="button" onClick={minimizeApp}>
                  <div
                    className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${color.inactive}`}
                  >
                    <Icon
                      width={24}
                      height={24}
                      className={color.iconInactive}
                    />
                  </div>
                </button>
              );
            }
          }

          const isActive = location.pathname === menu.path;

          return (
            <NavLink key={menu.path} to={menu.path!}>
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
};

/* =====================================================
   MAIN LAYOUT CORE
===================================================== */

const MainLayoutContent = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const { error, loading, isFullScreen } = useSelector((state: RootState) => state.ui);

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
    }
  }, [error]);

  if (isHome) {
    return (
      <div
        className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {!isFullScreen && (
          <div className="absolute top-4 left-24">
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
        <div className="absolute top-4 left-24">
          <RecorderComponents />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${
          isFullScreen ? "p-0 m-0" : isInternet ? "p-8" : "pt-6 pl-12 pr-12 pb-6"
        }`}
      >
        {!isInternet && !isFullScreen && <Navbar />}

        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden ${!isInternet && !isFullScreen ? "mt-4" : "m-0"}`}>
          <Outlet />
        </main>
      </div>

      {!isFullScreen && <Sidebar />}
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
    <ToastProvider>
      <MainLayoutContent />
    </ToastProvider>
  );
};

export default MainLayout;
