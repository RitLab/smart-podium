import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Student from "../pages/Student";
import Module from "../pages/Module";
import Internet from "../pages/Internet";

const PrivateRoute = ({ redirectTo = "/login" }) => {
  const user = useSelector((state: any) => state.auth.user);
  console.log("user", user);

  return user ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />

        <Route element={<PrivateRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="student" element={<Student />} />
          <Route path="module">
            <Route index element={<Module />} />
            <Route path=":id" element={<Module />} />
          </Route>
          <Route path="internet" element={<Internet />} />
        </Route>
      </Route>

      {/* catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
