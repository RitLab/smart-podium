import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const LoginLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default LoginLayout;
