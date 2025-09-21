import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MailIcon } from "lucide-react";

import { Logo } from "../../components/Icon";
import Input from "../../components/Input";
import { AppDispatch, RootState } from "../../stores";
import { forgotPassUser } from "../../stores/auth.store";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.ui);

  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(forgotPassUser({ email }));
      if (forgotPassUser.fulfilled.match(resultAction)) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
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

      <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<MailIcon size={18} />}
        />

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
