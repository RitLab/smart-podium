import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

import LockScreen from "../pages/Auth/LockScreen";
import InputPIN from "../pages/Auth/InputPIN";
import SettingPIN from "../pages/Auth/SettingPIN";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Student from "../pages/Student";
import Module from "../pages/Module";
import Internet from "../pages/Internet";
import File from "../pages/Module/File";

export default () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/lock-screen" element={<LockScreen />} />
        <Route path="/input-pin" element={<InputPIN />} />
        <Route path="/setting-pin" element={<SettingPIN />} />
      </Route>

      <Route path="/">
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="file" element={<File />} />
        <Route path="/" element={<MainLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="student" element={<Student />} />
          <Route path="module" element={<Module />} />
          <Route path="internet" element={<Internet />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>

      {/* catch all */}
      <Route path="*" element={<Navigate to="/lock-screen" replace />} />
    </Routes>
  );
};
