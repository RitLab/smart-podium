import bgImage from "../assets/images/bg-image.png";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const class_id = localStorage.getItem("class_id") || "";
  const pin = localStorage.getItem("pin") || "";

  if (class_id === "" || pin === "") {
    return <Navigate to="/setting-pin" replace />;
  }

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Outlet />
    </div>
  );
};

export default AuthLayout;
