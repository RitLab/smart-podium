import { Lock, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/stores";
import { verifyPin, clearError } from "@/stores/record";
import Loading from "@/components/Loading";

interface PINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherId: string;
}

const length = 6;

const PINModal: React.FC<PINModalProps> = ({ isOpen, onClose, onSuccess, teacherId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.record);
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      dispatch(clearError());
      setIsShaking(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isShaking) return;

      if (/^[0-9]$/.test(e.key)) {
        handlePress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pin, isShaking]);

  if (!isOpen) return null;

  const handlePress = async (num: string) => {
    dispatch(clearError());
    if (pin.length < length) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === length) {
        try {
          await dispatch(verifyPin({ teacher_id: teacherId, pin: newPin })).unwrap();
          onSuccess();
        } catch (err) {
          console.error("[PINModal] Verifikasi PIN gagal:", err);
          setPin(""); // Reset PIN kalo salah
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Heavy Backdrop Blur matching Lockscreen vibes */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[40px] transition-all duration-500"
        onClick={onClose}
      ></div>

      {/* Modal Content - Transparent Background, centered like Lockscreen */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-white p-6 animate-in fade-in zoom-in-95 duration-300">

        {/* Close Button - Optional but helpful */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/40 hover:text-white transition-all hover:rotate-90 duration-300"
        >
          <X size={32} />
        </button>

        <div className="flex flex-col items-center">
          <Lock size={24} className="text-white mb-6" />
          <h3 className="text-2xl font-light tracking-wide mb-2">Masukkan PIN</h3>
          <p className="text-white/60 text-sm mb-8">
            Masukkan PIN untuk mengakses Smart Podium
          </p>

          {/* Dots - Outlined when empty, solid when filled */}
          <div className="flex gap-5 mb-12">
            {Array.from({ length }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border border-white transition-all duration-300 ${i < pin.length ? "bg-white scale-110" : "bg-transparent opacity-40"
                  }`}
              ></div>
            ))}
          </div>

          {error && !isShaking && (
          <div className="h-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-400 text-[10px] tracking-[0.1em] font-bold uppercase">
                PIN TIDAK VALID
              </span>
            </div>
          </div>
        )}

          {/* Number Pad - Circular Buttons with Glassmorphism */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-6 select-none">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handlePress(num)}
                className="w-20 h-20 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-3xl font-light backdrop-blur-md"
              >
                {num}
              </button>
            ))}

            <div className="w-20 h-20"></div> {/* Spacer */}

            <button
              onClick={() => handlePress("0")}
              className="w-20 h-20 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-3xl font-light backdrop-blur-md"
            >
              0
            </button>

            <button
              onClick={handleDelete}
              className="w-20 h-20 flex items-center justify-center text-sm font-medium text-white/60"
            >
              Hapus
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-12 text-white/40 hover:text-white text-sm font-light tracking-widest uppercase transition-all"
          >
            Batal / Ganti Kelas
          </button>
        </div>
      </div>

      {loading && <Loading />}
    </div>
  );
};

export default PINModal;
