import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import LogoWhite from "@/assets/images/logo-white.png";
import { formattedDate, formattedTime } from "@/utils";
import { Image } from "@/components/Image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import { fetchEventByClassroomDate } from "@/stores/calendar";

const LockScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, eventList } = useSelector(
    (state: RootState) => state.calendar
  );

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    dispatch(
      fetchEventByClassroomDate({
        day,
        month,
        year,
      })
    );
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return (
    <>
    <div className="flex flex-col gap-2 justify-center items-center">
      <p className="text-red-500">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-white px-2 py-1 text-black border border-gray-200 rounded-md">Reload</button>
    </div>
    </>
  );

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"></div>
      <div
        className="h-full relative flex flex-col gap-12 items-center justify-between py-12"
        onClick={() => navigate("/input-pin")}
      >
        <Lock size={24} className="text-white" />
        <div className="flex flex-col items-center gap-24">
          <img
            src={LogoWhite}
            alt="Logo Smart Podium"
            className="h-24 w-auto object-contain"
          />

          <div className="text-white text-center">
            <h1 className="text-7xl font-bold">{formattedTime(time)}</h1>
            <p className="text-2xl mt-4">{formattedDate(time)}</p>
          </div>

          <div className="flex items-center gap-6 justify-between p-4 rounded-xl shadow-md bg-white/20">
            <Image
              src={eventList?.teacher_image}
              alt={eventList?.teacher_name}
              className="h-16 w-16"
            />

            <div className="flex flex-col gap-1 text-white">
              <h3 className="text-2xl">{eventList?.teacher_name}</h3>
              <p className="text-sm">{eventList?.class_name}</p>
            </div>
          </div>
        </div>

        <div className="text-white/50">
          Sentuh Layar untuk Membuka Smart Podium
        </div>
      </div>
    </>
  );
};

export default LockScreen;
