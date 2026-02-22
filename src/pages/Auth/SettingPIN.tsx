import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { AppDispatch, RootState } from "@/stores";
import Logo from "@/assets/images/logo.png";
import Input from "@/components/Input";
import { setError, setLoading } from "@/stores/ui";
import { getToken } from "@/stores/auth";

const SettingPIN = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.ui);

  const [pin, setPin] = useState("");
  const [checkingGuard, setCheckingGuard] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);

  const disabled = useMemo(() => {
    return loading || pin.length < 6;
  }, [loading, pin]);

  /**
   * 🔐 GUARD
   */
  useEffect(() => {
    const licenseKey = localStorage.getItem("license_key");
    const savedPin = localStorage.getItem("pin");
    const savedClassId = localStorage.getItem("class_id");

    // ❌ Tidak ada license
    if (!licenseKey) {
      navigate("/license", { replace: true });
      return;
    }

    // ❌ Tidak ada class_id
    if (!savedClassId) {
      navigate("/license", { replace: true });
      return;
    }

    // ✅ Sudah pernah set PIN
    if (savedPin) {
      navigate("/home", { replace: true });
      return;
    }

    // ✅ Lolos guard
    setClassId(savedClassId);
    setCheckingGuard(false);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classId) {
      dispatch(setError("Class tidak ditemukan"));
      return;
    }

    dispatch(setLoading(true));

    try {
      dispatch(setError(""));

      localStorage.setItem("pin", pin);

      await dispatch(getToken({ pin, classId })).unwrap();

      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      dispatch(setError("Failed to set PIN"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ⛔ Jangan render sebelum guard selesai
  if (checkingGuard) return null;

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"></div>

      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl min-h-1/2 h-auto w-full max-w-sm">
        <img src={Logo} alt="Logo" className="h-18 w-96 object-contain" />

        <h2 className="text-2xl text-bold text-center mb-6 mt-6">
          Atur PIN
        </h2>

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <Input
            placeholder="PIN"
            variant="number"
            maxLength={6}
            value={pin}
            onChange={(value) => setPin(value)}
          />

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={disabled}
              className={`w-full flex justify-center items-center bg-blue-600 text-white font-medium py-2 rounded-md transition ${
                disabled ? "opacity-60" : "hover:bg-blue-700"
              }`}
            >
              {loading && (
                <LoaderCircle
                  size={16}
                  className="animate-spin mr-2"
                />
              )}
              <div>Kirim</div>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingPIN;