import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailIcon } from "lucide-react";

import { Logo } from "../../components/Icon";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    setTimeout(() => {
      navigate("/login");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl min-h-1/2 h-auto w-full max-w-sm">
      <div className="flex justify-center">
        <Logo />
      </div>

      <h2 className="text-2xl text-bold text-center mb-6 mt-6">
        Lupa Password
      </h2>
      <div className="text-sm text-center">
        Masukkan Email Anda, akan dikirim kode verifikasi di email
      </div>

      <form className="space-y-4 mt-6" onSubmit={handleLogin}>
        <div className="relative">
          <MailIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-medium py-2 rounded-md transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
