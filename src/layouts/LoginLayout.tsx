import { ReactNode } from "react";
import bgImage from "../assets/images/bg-image.png";

interface Props {
  children: ReactNode;
}

const LoginLayout = ({ children }: Props) => {
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      {children}
    </div>
  );
};

export default LoginLayout;
