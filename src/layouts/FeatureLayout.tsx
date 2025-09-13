import { ReactNode } from "react";
import bgImage from "../assets/images/bg-solid.png";

interface Props {
  children: ReactNode;
}

const FeatureLayout = ({ children }: Props) => {
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex justify-center items-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {children}
    </div>
  );
};

export default FeatureLayout;
