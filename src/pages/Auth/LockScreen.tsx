import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import LogoWhite from "@/assets/images/logo-white.png";
import { formattedDate, formattedTime } from "@/utils";
import { Image } from "@/components/Image";

const LockScreen = () => {
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
            <Image src={""} alt={"user?.name"} className="h-16 w-16" />

            <div className="flex flex-col gap-1 text-white">
              <h3 className="text-2xl">{"Bastian Sinaga"}</h3>
              <p className="text-sm">{"Pelatihan Penanggulangan Terorisme"}</p>
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
