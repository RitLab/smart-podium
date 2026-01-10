import { Clock9, Timer } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
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
} from "@/components/Icon";
import { Image } from "@/components/Image";
import Loading from "@/components/Loading";
import { formatDuration, formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth";
import { Toast, ToastContextType, ToastType } from "@/types/ui";
import ToastComponent from "@/components/Toast";

const menus = [
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
  { path: "/internet", label: "Penampil Web", icon: WebIcon, color: "red" },
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

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastComponent toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  );
};

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { eventList } = useSelector((state: RootState) => state.calendar)
  const [time, setTime] = useState(new Date());
  const [studySeconds, setStudySeconds] = useState(0);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setStudySeconds((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between">
      <img src={Logo} alt="Logo" className="h-28 w-96 object-contain" />

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-white shadow-md rounded-md p-4 w-auto">
          <Image src={eventList?.teacher_image} alt={eventList?.teacher_name} className="h-14 w-14" />
          <div className="mx-3">
            <h3 className="font-semibold text-gray-900">{eventList?.teacher_name}</h3>
            <p className="text-sm text-gray-600">{eventList?.course_name}</p>
          </div>
        </div>

        <div className="flex bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-md shadow-md">
          <div className="p-4 border-r border-white/30 flex flex-col justify-center">
            <p className="text-sm">{formattedDate(time)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock9 size={16} />
              <span className="text-lg font-bold">{formattedTime(time)}</span>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <p className="text-sm">Waktu Belajar</p>
            <div className="flex items-center gap-2 mt-1">
              <Timer size={16} />
              <span className="text-lg font-bold">
                {formatDuration(studySeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex flex-col justify-center">
      <div className="w-20 flex flex-col items-center py-6 gap-6 bg-white shadow-lg rounded-l-2xl">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = location.pathname === menu.path;
          const color = colorMap[menu.color as keyof typeof colorMap];

          return (
            <NavLink key={menu.path} to={menu.path}>
              <div
                className={`h-12 w-12 flex items-center justify-center rounded-lg transition hover:scale-105 bg-gradient-to-b ${
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

        <div className="mt-20">
          <NavLink
            to="/home"
            className="h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100"
          >
            <HomeIcon width={24} height={24} className="text-orange-600" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

const MainLayout = () => {
  const class_id = localStorage.getItem("class_id") || "";
  const pin = localStorage.getItem("pin") || "";
  const token = sessionStorage.getItem("token") || "";

  if (class_id === "" || pin === "") {
    return <Navigate to="/setting-pin" replace />;
  }

  if (token === "") {
    return <Navigate to="/lock-screen" replace />;
  }

  const location = useLocation();
  const { showToast } = useToast();
  const { error, loading } = useSelector((state: RootState) => state.ui);

  const isHome = location.pathname === "/home";
  const isInternet = location.pathname === "/internet";

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
        <Outlet />

        {loading && <Loading />}
      </div>
    );
  }

  return (
    <ToastProvider>
      <div
        className="min-h-screen w-full bg-cover bg-center flex"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className={`flex-1 flex flex-col ${
            !isInternet ? "pt-12 pl-24 pr-12" : "p-8"
          }`}
        >
          {!isInternet && <Navbar />}

          <main className={`flex-1 ${!isInternet ? "py-12" : "py-8"}`}>
            <Outlet />
          </main>
        </div>
        <Sidebar />
        {loading && <Loading />}
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
