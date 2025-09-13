import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react";

import { Logo } from "../../components/Icon";
import { login } from "../../stores/auth";
import Input from "../../components/Input";

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
        navigate("/home");
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
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<MailIcon size={18} />}
        />

        <Input
          placeholder="Password"
          variant="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftIcon={<LockIcon size={18} />}
        />

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
