import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const HomeLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default HomeLayout;
