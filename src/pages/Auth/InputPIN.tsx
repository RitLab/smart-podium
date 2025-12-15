import { Lock } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { AppDispatch, RootState } from "@/stores";
import { getToken, setErrorPin } from "@/stores/auth.store";
import Loading from "@/components/Loading";

const length = 6;

const InputPIN = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { errorPin, loading } = useSelector((state: RootState) => state.auth);

  const [pin, setPin] = useState("");

  const handlePress = async (num: string) => {
    dispatch(setErrorPin(""));
    if (pin.length < length) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === length) await onSubmit(newPin);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const onSubmit = async (enteredPin: string) => {
    try {
      await dispatch(getToken({ pin: enteredPin })).unwrap();
      navigate("/home");
    } catch (err) {
      console.error(err);
      setPin("");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl"></div>

      <div className="relative z-10 flex flex-col items-center text-white">
        <Lock size={24} className="text-white" />
        <div className="text-2xl mt-8 mb-2">Masukkan PIN</div>
        <div className="text-sm mb-6">
          Masukkan PIN untuk mengakses Smart Podium
        </div>

        {/* Dots */}
        <div className="flex gap-4">
          {Array.from({ length }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border border-white transition-all ${
                i < pin.length ? "bg-white" : "bg-transparent"
              }`}
            ></div>
          ))}
        </div>

        {errorPin && <div className="mt-8 text-red-300">{errorPin}</div>}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-6 text-3xl mt-16 select-none">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num)}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition"
            >
              {num}
            </button>
          ))}

          {/* Empty placeholder */}
          <div></div>

          {/* 0 */}
          <button
            onClick={() => handlePress("0")}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition"
          >
            0
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-20 h-20 flex items-center justify-center text-base"
          >
            Hapus
          </button>
        </div>
      </div>
      {loading && <Loading />}
    </div>
  );
};

export default InputPIN;
