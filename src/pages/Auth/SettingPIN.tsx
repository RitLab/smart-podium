import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { AppDispatch, RootState } from "@/stores";
import Logo from "@/assets/images/logo.png";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { setError, setLoading } from "@/stores/ui.store";
import { fetchClass, getToken } from "@/stores/auth.store";

const SettingPIN = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.ui);
  const { classList } = useSelector((state: RootState) => state.auth);

  const [pin, setPin] = useState("");
  const [classId, setClassId] = useState("");

  const disabled = useMemo(() => {
    return loading || pin.length < 6 || classId === "";
  }, [loading, pin, classId]);

  useEffect(() => {
    dispatch(fetchClass());
  }, [dispatch]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(setLoading(true));

    localStorage.setItem("pin", pin);
    localStorage.setItem("class_id", classId);

    try {
      dispatch(setError(""));
      await dispatch(getToken({ pin: pin, classId: classId })).unwrap();
      navigate("/home");
    } catch (err) {
      console.error(err);
      dispatch(setError("Failed to set PIN"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"></div>
      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl min-h-1/2 h-auto w-full max-w-sm">
        <img src={Logo} alt="Logo" className="h-18 w-96 object-contain" />

        <h2 className="text-2xl text-bold text-center mb-6 mt-6">Atur PIN</h2>
        {loading}

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <Input
            placeholder="PIN"
            variant="number"
            maxLength={6}
            value={pin}
            onChange={(value) => setPin(value)}
          />

          <Select
            placeholder="Pilih Kelas"
            value={classId}
            onChange={(value) => setClassId(String(value))}
            options={classList.map((cls) => ({
              label: cls.name,
              value: cls.id,
            }))}
          />

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={disabled}
              className={`w-full flex justify-center items-center bg-blue-600 text-white font-medium py-2 rounded-md transition ${
                disabled ? "opacity-60" : "hover:bg-blue-700"
              }`}
              aria-disabled={disabled}
            >
              {loading && (
                <LoaderCircle size={16} className="animate-spin mr-2" />
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
