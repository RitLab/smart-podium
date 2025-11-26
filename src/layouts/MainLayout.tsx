import { Clock9, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";

import bgImage from "../assets/images/bg-solid.png";
import Logo from "../assets/images/logo.png";
import {
  BookIcon,
  CalendarIcon,
  HomeIcon,
  UsersIcon,
  WebIcon,
} from "../components/Icon";
import { Image } from "../components/Image";
import Loading from "../components/Loading";
import { formatDuration, formattedDate, formattedTime } from "../utils";
import { AppDispatch, RootState } from "../stores";
import { fetchUser } from "../stores/auth.store";
import { useToast } from "../provider/Toast.Provider";

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

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
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
          <Image src={user?.photo} alt={user?.name} className="h-14 w-14" />
          <div className="mx-3">
            <h3 className="font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-600">{user?.class}</p>
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
  return (
    <aside className="flex flex-col justify-center">
      <div className="w-20 h-auto flex flex-col items-center py-6 gap-6 bg-white shadow-lg rounded-l-2xl">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = location.pathname === menu.path;

          return (
            <div key={menu.path}>
              <NavLink to={menu.path}>
                <div
                  className={`h-12 w-12 flex items-center justify-center rounded-lg transition hover:scale-105 bg-gradient-to-b ${
                    isActive
                      ? `from-${menu.color}-500 to-${menu.color}-600 hover:from-${menu.color}-700 hover:to-${menu.color}-800`
                      : `from-gray-50 to-gray-100 hover:from-${menu.color}-50 hover:to-${menu.color}-100`
                  }`}
                >
                  <Icon
                    width={24}
                    height={24}
                    className={`${
                      isActive ? `text-white` : `text-${menu.color}-600`
                    }`}
                  />
                </div>
              </NavLink>
            </div>
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
  const token = localStorage.getItem("token") || "";

  if (token === "") {
    return <Navigate to="/login" replace />;
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
    <div
      className="min-h-screen w-full bg-cover bg-center flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className={`flex-1 flex flex-col ${
          !isInternet ? "pt-20 pl-24 pr-12" : "p-8"
        }`}
      >
        {!isInternet && <Navbar />}

        <main className={`flex-1 ${!isInternet ? "py-24" : "py-8"}`}>
          <Outlet />
        </main>
      </div>
      <Sidebar />
      {loading && <Loading />}
    </div>
  );
};

export default MainLayout;
