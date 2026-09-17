import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { AppDispatch, RootState } from "@/stores";
import Logo from "@/assets/images/logo.png";
import Select from "@/components/Select";
import { setError, setLoading } from "@/stores/ui";
import { fetchClass } from "@/stores/auth";

const SettingPIN = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.ui);
  const { classList } = useSelector((state: RootState) => state.auth);

  const [classId, setClassId] = useState("");

  const disabled = useMemo(() => {
    return loading || classId === "";
  }, [loading, classId]);

  useEffect(() => {
    dispatch(fetchClass());
  }, [dispatch]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(setLoading(true));

    localStorage.setItem("class_id", classId);

    try {
      dispatch(setError(""));
      navigate("/home");
    } catch (err) {
      console.error(err);
      dispatch(setError("Gagal memilih kelas"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"></div>
      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl min-h-1/2 h-auto w-full max-w-sm">
        <img src={Logo} alt="Logo" className="h-18 w-96 object-contain" />

        <h2 className="text-2xl text-bold text-center mb-6 mt-6">Masuk Kelas</h2>

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <Select
            placeholder="Pilih Kelas"
            value={classId}
            onChange={(value) => setClassId(String(value))}
            options={(Array.isArray(classList) ? classList : []).map((cls) => ({
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
              <div>Masuk</div>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingPIN;