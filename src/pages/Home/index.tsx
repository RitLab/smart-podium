import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import Logo from "@/assets/images/logo.png";
import { BookIcon, CalendarIcon, UsersIcon, WebIcon } from "@/components/Icon";
import { Image } from "@/components/Image";

import { formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth";
import { startRecord } from "@/stores/record";

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

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const { eventList } = useSelector((state: RootState) => state.calendar);

  const [time, setTime] = useState(new Date());
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const getStartTimeToday = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.getTime();
  };

  useEffect(() => {
    if (!eventList?.start_time) return;

    const startTime = getStartTimeToday(eventList?.start_time);

    console.log(startTime);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = startTime - now;

      if (diff <= 0) {
        setIsStarted(true);
        setCountdown(null);
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setCountdown(
          `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0",
          )}`,
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventList?.start_time]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const handleStart = async (e: any) => {
    e.preventDefault();
    try {
      navigate("/module");
      await dispatch(startRecord()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  // debug lockscreen page
  const clickCountRef = useRef(0);
  const handleClick = () => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 5) {
      clickCountRef.current = 0;
      navigate("/lock-screen");
    }

    setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-between py-24">
      <div>
        <p className="text-xs text-gray-400 text-center mb-2">Smart Podium v{__APP_VERSION__}</p>
        <div className="flex flex-col gap-16">
          <img
            src={Logo}
            alt="Logo"
            className="h-18 w-96 object-contain"
            onClick={handleClick}
          />

          <div className="text-center">
            <h1 className="text-7xl font-bold text-gray-800">
              {formattedTime(time)}
            </h1>
            <p className="text-2xl text-gray-600 mt-4">{formattedDate(time)}</p>
          </div>

          <div className="flex items-center gap-6 justify-between p-4 rounded-xl shadow-md bg-white border">
            <Image
              src={eventList?.teacher_image}
              alt={eventList?.teacher_name}
              className="h-16 w-16"
            />

            <div className="flex flex-col gap-1">
              <h3 className="text-2xl text-gray-800">
                {eventList?.teacher_name}
              </h3>
              <p className="text-sm text-gray-600">
                {eventList?.class_room_name}
              </p>
            </div>

            {isStarted ? (
              <button
                className="flex flex-col items-center gap-1 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-emerald-600 hover:to-emerald-800 transition"
                onClick={handleStart}
              >
                <LogOut size={18} />
                <div>Mulai</div>
              </button>
            ) : (
              <button
                className="flex flex-col items-center gap-1 bg-gradient-to-b from-[#FFC35C] to-[#FCA106] text-white px-4 py-2 rounded-lg font-medium text-sm opacity-80 cursor-not-allowed"
                disabled
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <div key={menu.path}>
              <NavLink to={menu.path}>
                <div className="flex flex-col items-center hover:scale-105">
                  <div
                    className={`h-24 w-24 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-b from-${menu.color}-500 to-${menu.color}-600 hover:from-${menu.color}-700 hover:to-${menu.color}-800`}
                  >
                    <Icon width={58} height={58} className="text-white" />
                  </div>
                  <p className="mt-4 text-gray-700 font-medium">{menu.label}</p>
                </div>
              </NavLink>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
