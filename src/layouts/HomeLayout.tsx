import { Outlet } from "react-router-dom";

import bgImage from "../assets/images/bg-solid.png";

const HomeLayout = () => {
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Outlet />
    </div>
  );
};

export default HomeLayout;
