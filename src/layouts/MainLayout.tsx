import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Clock9, Timer } from "lucide-react";

import bgImage from "../assets/images/bg-solid.png";
import user from "../assets/images/user.png";

import {
  BookIcon,
  CalendarIcon,
  HomeIcon,
  Logo,
  UsersIcon,
  WebIcon,
} from "../components/Icon";

const MainLayout = () => {
  const location = useLocation();

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

  const [time, setTime] = useState(new Date());
  const [studySeconds, setStudySeconds] = useState(0);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setStudySeconds((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatDuration = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h} : ${m} : ${s}`;
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col pl-24 pr-12 pt-20">
        {/* Header */}
        <header className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Profile */}
          <div className="flex items-center gap-6">
            {/* Profile Card */}
            <div className="flex items-center bg-white shadow-md rounded-xl p-3 w-auto">
              <img
                src={user}
                alt="User"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="mx-3">
                <h3 className="font-semibold text-gray-900">Bastian Sinaga</h3>
                <p className="text-sm text-gray-600">
                  Pelatihan Penanggulangan Terorisme
                </p>
              </div>
            </div>

            {/* Time Card */}
            <div className="flex bg-gradient-to-r from-blue-700 to-cyan-500 text-white rounded-xl shadow-md">
              <div className="px-5 py-3 border-r border-white/30 flex flex-col justify-center">
                <p className="text-sm">{formattedDate}</p>
                <div className="flex items-center gap-2">
                  <Clock9 />
                  <span className="text-lg font-bold">{formattedTime}</span>
                </div>
              </div>
              <div className="px-5 py-3 flex flex-col justify-center">
                <p className="text-sm">Waktu Belajar</p>
                <div className="flex items-center gap-2">
                  <Timer />
                  <span className="text-lg font-bold">
                    {formatDuration(studySeconds)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Body kosong (bisa diisi konten lain) */}
        <main className="flex 1 py-24">
          <Outlet />
        </main>
      </div>

      <aside className="flex flex-col justify-center">
        {/* Sidebar Right */}
        <div className="w-20 h-auto flex flex-col items-center py-6 gap-6 bg-white shadow-lg rounded-l-2xl">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname === menu.path;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                className={`h-12 w-12 flex items-center justify-center rounded-lg transition bg-gradient-to-b ${
                  isActive
                    ? `from-${menu.color}-400 to-${menu.color}-600 hover:from-${menu.color}-700 hover:to-${menu.color}-800`
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
    </div>
  );
};

export default MainLayout;
