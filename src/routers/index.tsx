import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import HomeLayout from "../layouts/HomeLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Student from "../pages/Student";
import Module from "../pages/Module";
import Internet from "../pages/Internet";
import File from "../pages/Module/File";

const PrivateRoute = ({ redirectTo = "/login" }) => {
  const token = localStorage.getItem("token");

  return token && token !== "" ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} replace />
  );
};

export default () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/file">
        <Route element={<PrivateRoute />}>
          <Route index element={<File />} />
        </Route>
      </Route>

      <Route path="/">
        <Route index element={<Navigate to="/home" replace />} />

        <Route element={<PrivateRoute />}>
          <Route path="home" element={<HomeLayout />}>
            <Route index element={<Home />} />
          </Route>

          <Route path="file" element={<File />} />

          <Route element={<MainLayout />}>
            <Route path="calendar" element={<Calendar />} />
            <Route path="student" element={<Student />} />
            <Route path="module" element={<Module />} />
            <Route path="internet" element={<Internet />} />
          </Route>
        </Route>
      </Route>

      {/* catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
