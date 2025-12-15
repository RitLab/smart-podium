import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import Logo from "@/assets/images/logo.png";
import { BookIcon, CalendarIcon, UsersIcon, WebIcon } from "@/components/Icon";
import { Image } from "@/components/Image";

import { formattedDate, formattedTime } from "@/utils";
import type { AppDispatch, RootState } from "@/stores";
import { fetchUser } from "@/stores/auth.store";

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

  const [time, setTime] = useState(new Date());

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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-between py-24">
      <div className="flex flex-col gap-16">
        <img src={Logo} alt="Logo" className="h-18 w-96 object-contain" />

        <div className="text-center">
          <h1 className="text-7xl font-bold text-gray-800">
            {formattedTime(time)}
          </h1>
          <p className="text-2xl text-gray-600 mt-4">{formattedDate(time)}</p>
        </div>

        <div className="flex items-center gap-6 justify-between p-4 rounded-xl shadow-md bg-white border">
          <Image src={user?.photo} alt={user?.name} className="h-16 w-16" />

          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-gray-800">{user?.name}</h3>
            <p className="text-sm text-gray-600">{user?.class}</p>
          </div>

          <button
            className="flex flex-col items-center gap-1 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gradient-to-b hover:from-emerald-600 hover:to-emerald-800 transition"
            onClick={handleStart}
          >
            <LogOut size={18} />
            <div>Mulai</div>
          </button>
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
