import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const FeatureLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default FeatureLayout;
