import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookIcon,
  CalendarIcon,
  Logo,
  UsersIcon,
  WebIcon,
} from "../../components/Icon";
import User from "../../assets/images/user.png";
import MenuCard from "../../components/MenuCard";

const Home = () => {
  const navigation = useNavigate();
  const [time, setTime] = useState(new Date());

  // Biar jam real-time
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-between">
      <Logo />

      <div className="text-center mt-20">
        <h1 className="text-6xl font-bold text-gray-800">{formattedTime}</h1>
        <p className="text-gray-600 mt-6">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mt-20">
        <MenuCard
          icon={<CalendarIcon className="h-16 w-16" />}
          label="Kalender Akademik"
          bg="from-blue-400 to-blue-600"
          handleClick={() => navigation("/calendar")}
        />
        <MenuCard
          icon={<UsersIcon className="h-16 w-16" />}
          label="Manajemen Peserta Didik"
          bg="from-green-400 to-green-600"
          handleClick={() => navigation("/student")}
        />
        <MenuCard
          icon={<BookIcon className="h-16 w-16" />}
          label="Materi Pelajaran"
          bg="from-yellow-400 to-yellow-500"
          handleClick={() => navigation("/module")}
        />
        <MenuCard
          icon={<WebIcon className="h-16 w-16" />}
          label="Penampil Web"
          bg="from-red-400 to-red-500"
          handleClick={() => navigation("/internet")}
        />
      </div>

      <div className="w-full max-w-md flex items-center justify-between p-4 rounded-xl shadow-md bg-white border mt-20">
        <div className="flex items-center gap-3">
          <img
            src={User}
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">Bastian Sinaga</h3>
            <p className="text-sm text-gray-600">
              Pelatihan Penanggulangan Terorisme
            </p>
          </div>
        </div>

        <button className="flex flex-col items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-red-600 transition">
          <LogOut size={18} />
          <div>Keluar</div>
        </button>
      </div>
    </div>
  );
};

export default Home;
