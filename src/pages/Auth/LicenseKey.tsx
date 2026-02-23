import { LoaderCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Logo from "@/assets/images/logo.png";

const LicenseKey = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const disabled = useMemo(() => {
    return loading || licenseKey.length < 10;
  }, [loading, licenseKey]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔥 TODO: panggil API validasi license di sini
      // await dispatch(validateLicense(licenseKey)).unwrap()

      // sementara kita anggap valid
      localStorage.setItem("license_key", licenseKey);
      localStorage.setItem('class_id', 'cda08ef8-d61d-42a6-a3ac-f94bc9d6d96c')

      navigate("/setting-pin");
    } catch (err) {
      setError("License key tidak valid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"></div>

      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl min-h-1/2 w-full max-w-sm">
        <img src={Logo} alt="Logo" className="h-18 w-96 object-contain" />

        <h2 className="text-2xl text-bold text-center mb-6 mt-6">
          Masukkan License Key
        </h2>

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="License Key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
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
            >
              {loading && (
                <LoaderCircle size={16} className="animate-spin mr-2" />
              )}
              <div>Aktivasi</div>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LicenseKey;