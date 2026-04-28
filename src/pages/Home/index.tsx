import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { LogOut, Minus } from "lucide-react";

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
import { startRecord, stopRecord, clearError } from "@/stores/record";

import { useToast } from "@/components/ToastProvider";

/* ================= MENU TYPE ================= */

type MenuItem = {
  label: string;
  icon: any;
  color: keyof typeof colorMap;
  path?: string;
  action?: "whiteboard" | "minimize" | "zoom";
};

/* ================= MENU LIST ================= */

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
    color: "green",
  },
  {
    action: "zoom",
    label: "Zoom",
    icon: ZoomIcon,
    color: "blue",
  },
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
      className={`h-24 w-24 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-b ${
        colorMap[menu.color]
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
  const { isRecording, session_id, error } = useSelector(
    (state: RootState) => state.record,
  );

  const [time, setTime] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<any>(null);

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

    const todayEvents = rawEvents.filter(ev => ev.event_date === todayStr);

    if (todayEvents.length === 0) {
      setActiveEvent(null);
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
  }, [rawEvents, time]);

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

  /* ================= COUNTDOWN START ================= */

  useEffect(() => {
    if (!activeEvent?.start_time) {
      setIsStarted(false);
      setCountdown(null);
      return;
    }

    const startTime = getTimeToday(activeEvent.start_time);
    const endTime = getTimeToday(activeEvent.end_time);

    const interval = setInterval(() => {
      const now = Date.now();
      
      if (now >= startTime && now < endTime) {
        setIsStarted(true);
        setCountdown(null);
      } else if (now < startTime) {
        setIsStarted(false);
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
        setIsStarted(false);
        setCountdown(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  /* ================= AUTO STOP RECORD ================= */

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

  const handleRecordToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!activeEvent) return;

    try {
      if (!isRecording) {
        await dispatch(startRecord({ id: String(activeEvent.id) })).unwrap();

        navigate("/module");
      } else {
        if (!session_id) return;

        await dispatch(
          stopRecord({
            session_id,
            event_id: String(activeEvent.id),
          }),
        ).unwrap();
      }
    } catch (err) {
      console.error("Record error:", err);
    }
  };



  /* ================= RENDER ================= */

  return (
    <div className="relative h-full flex flex-col items-center justify-between py-24">
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

            {isStarted ? (
              <button
                onClick={handleRecordToggle}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition text-white ${
                  isRecording
                    ? "bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                    : "bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 animate-pulse ring-4 ring-emerald-500/50"
                }`}
              >
                <LogOut size={18} />
                <div>{isRecording ? "Stop" : "Mulai"}</div>
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
      <div className="grid grid-cols-3 md:grid-cols-6 gap-x-12 gap-y-10 text-center max-w-6xl px-8">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const renderMenu = (
            <div key={menu.label} className="group flex flex-col items-center">
              <div
                className={`h-24 w-24 rounded-[2rem] flex items-center justify-center shadow-xl shadow-gray-200 bg-gradient-to-b transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-active:scale-95 ${
                  colorMap[menu.color]
                }`}
              >
                <Icon width={52} height={52} className="text-white drop-shadow-md" />
              </div>
              <p className="mt-4 text-sm text-gray-700 font-bold tracking-tight opacity-90 group-hover:opacity-100 group-hover:text-blue-600 transition-all">
                {menu.label}
              </p>
            </div>
          );

          if (menu.action === "whiteboard") {
            return (
              <button key={menu.label} type="button" onClick={openWhiteboard} className="outline-none">
                {renderMenu}
              </button>
            );
          }

          if (menu.action === "zoom") {
            return (
              <button key={menu.label} type="button" onClick={openZoom} className="outline-none">
                {renderMenu}
              </button>
            );
          }

          return (
            <NavLink key={menu.label} to={menu.path || "/"}>
              {renderMenu}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
