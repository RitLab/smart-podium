import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react";

import { Logo } from "../../components/Icon";
import { useDispatch } from "react-redux";
import { login } from "../../stores/auth";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (password === "1111") {
        setError("Salah");
      } else {
        dispatch(login({ email, password }));
      }
      setLoading(false);
    }, 1000);
  };

  const handleSSO = () => {};

  return (
    <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-sm">
      <div className="flex justify-center">
        <Logo />
      </div>

      <h2 className="text-2xl text-bold text-center mb-6 mt-6">Sign In</h2>
      <div className="text-sm text-center">
        Masukkan email dan password anda untuk mengakses akun
      </div>

      <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
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

        <div className="mb-2 relative">
          <LockIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        <div className="mb-4 text-right">
          <a
            className="text-sm text-gray-500 hover:underline hover:cursor-pointer"
            onClick={handleForgotPassword}
          >
            Lupa Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-medium py-2 rounded-md transition ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="my-4 border-t"></div>

        <button
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-md"
          onClick={handleSSO}
        >
          Sign in With SSO
        </button>
      </form>
    </div>
  );
};

export default Login;
