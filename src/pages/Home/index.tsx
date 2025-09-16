import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import {
  BookIcon,
  CalendarIcon,
  Logo,
  UsersIcon,
  WebIcon,
} from "../../components/Icon";
import { Image } from "../../components/Image";

import { formattedDate, formattedTime } from "../../utils";
import { AppDispatch, RootState } from "../../stores";
import { fetchUser, logoutUser } from "../../stores/auth.store";

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
  const navigation = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { error, loading } = useSelector((state: RootState) => state.ui);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const handleLogout = async () => {
    dispatch(logoutUser());
    if (!error && !loading) {
      navigation("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between">
      <Logo />

      <div className="text-center mt-20">
        <h1 className="text-6xl font-bold text-gray-800">
          {formattedTime(time)}
        </h1>
        <p className="text-gray-600 mt-6">{formattedDate(time)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mt-20">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <div key={menu.path}>
              <NavLink to={menu.path}>
                <div className="flex flex-col items-center hover:scale-105">
                  <div
                    className={`h-32 w-32 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-b from-${menu.color}-500 to-${menu.color}-600 hover:from-${menu.color}-700 hover:to-${menu.color}-800`}
                  >
                    <Icon width={80} height={80} className="text-white" />
                  </div>
                  <p className="mt-4 text-gray-700 font-medium">{menu.label}</p>
                </div>
              </NavLink>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-md flex items-center justify-between p-4 rounded-xl shadow-md bg-white border mt-20">
        <div className="flex items-center gap-3">
          <Image src={user?.photo} alt={user?.name} className="h-12 w-12" />

          <div>
            <h3 className="font-semibold text-gray-800">{user?.name}</h3>
            <p className="text-sm text-gray-600">{user?.class}</p>
          </div>
        </div>

        <button
          className="flex flex-col items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-red-600 transition"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <div>Keluar</div>
        </button>
      </div>
    </div>
  );
};

export default Home;
