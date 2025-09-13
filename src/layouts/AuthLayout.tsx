import bgImage from "../assets/images/bg-image.png";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
