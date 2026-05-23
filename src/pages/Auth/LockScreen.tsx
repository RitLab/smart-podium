import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import LogoWhite from "@/assets/images/logo-white.png";
import { formattedDate, formattedTime } from "@/utils";
import { Image } from "@/components/Image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import { fetchEventList } from "@/stores/calendar";
import { useToast } from "@/components/ToastProvider";

const LockScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, rawEvents } = useSelector(
    (state: RootState) => state.calendar
  );

  const { showToast, dismissToast } = useToast();
  const { isRecording } = useSelector((state: RootState) => state.record);

  const [time, setTime] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    dispatch(
      fetchEventList({
        month,
        year,
      })
    );

    const checkInterval = setInterval(() => {
      dispatch(
        fetchEventList({
          month,
          year,
        })
      );
    }, 10000); // Check every 10s

    return () => clearInterval(checkInterval);
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

    // 1. Cari yang sedang jalan
    let current = todayEvents.find(ev =>
      ev.start_time <= currentTimeStr && ev.end_time > currentTimeStr
    );

    // 2. Jika tidak ada yang sedang jalan, cari yang akan datang (upcoming)
    if (!current) {
      current = todayEvents
        .filter(ev => ev.start_time > currentTimeStr)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    }

    // Jika semua selesai → kosongkan, jangan tampilkan event terakhir
    setActiveEvent(current || null);
  }, [rawEvents, time]);

  /* ================= CHECK IF STARTED ================= */
  useEffect(() => {
    if (!activeEvent?.start_time || !activeEvent?.end_time) {
      setIsStarted(false);
      return;
    }

    const getTimeToday = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d.getTime();
    };

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = getTimeToday(activeEvent.start_time);
      const endTime = getTimeToday(activeEvent.end_time);

      if (now >= startTime && now < endTime) {
        setIsStarted(true);
      } else {
        setIsStarted(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  /* ================= ENFORCE START NOTIFICATION ================= */
  useEffect(() => {
    if (isStarted && !isRecording) {
      let lastToastId: number | null = null;
      const fire = () => {
        lastToastId = showToast(
          "Kelas telah dimulai, silakan klik tombol mulai untuk memulai kelas.",
          "info"
        );
      };

      fire();
      const interval = setInterval(() => {
        fire();
      }, 10000);

      return () => {
        clearInterval(interval);
        if (lastToastId !== null) dismissToast(lastToastId);
      };
    }
  }, [dismissToast, isStarted, isRecording, showToast]);

  if (error) return (
    <div className="flex flex-col gap-4 justify-center items-center bg-black/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
      <div className="flex flex-col items-center gap-2">
        <p className="text-red-400 font-semibold text-lg">Network Error or System Trouble</p>
        <p className="text-white/70 text-sm max-w-xs text-center">{error}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="bg-white hover:bg-gray-100 px-6 py-2 text-black font-medium rounded-lg transition-all active:scale-95 shadow-lg"
        >
          Reload
        </button>
        <button
          onClick={() => window.ipcRenderer.invoke('show-quit-dialog')}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 text-white font-medium rounded-lg transition-all active:scale-95 shadow-lg"
        >
          Keluar
        </button>
      </div>
    </div>
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

          {activeEvent && (
            <div className="flex items-center gap-6 justify-between p-4 rounded-xl shadow-md bg-white/20">
              <Image
                src={activeEvent?.teacher_image}
                alt={activeEvent?.teacher_name}
                className="h-16 w-16"
              />

              <div className="flex flex-col gap-1 text-white">
                <h3 className="text-2xl">{activeEvent?.teacher_name}</h3>
                <p className="text-sm">{activeEvent?.course_name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-white/50">
          Sentuh Layar untuk Membuka Smart Podium
        </div>
      </div>
    </>
  );
};

export default LockScreen;
