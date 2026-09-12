import { Navigate, Route, Routes } from "react-router";
import { ToastProvider } from "@/components/ToastProvider";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import InputPIN from "@/pages/Auth/InputPIN";
import LockScreen from "@/pages/Auth/LockScreen";
import SettingPIN from "@/pages/Auth/SettingPIN";
import LicenseKey from "@/pages/Auth/LicenseKey";
import Calendar from "@/pages/Calendar";
import Home from "@/pages/Home";
import Module from "@/pages/Module";
import File from "@/pages/Module/File";
import ImageViewer from "@/pages/Module/ImageViewer";
import VideoPlayer from "@/pages/Module/VideoPlayer";
import Interactive from "@/pages/Module/Interactive";
import ThreeDimensionViewer from "@/pages/Module/ThreeDimensionViewer";
import Student from "@/pages/Student";
import Viewer from "@/pages/Module/Viewer";

export default () => {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/lock-screen" element={<Navigate to="/home" replace />} />
          <Route path="/input-pin" element={<Navigate to="/home" replace />} />
          <Route path="/setting-pin" element={<SettingPIN />} />
          <Route path="/license" element={<LicenseKey />} />
        </Route>

        <Route path="/">
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="file" element={<File />} />
          <Route path="video" element={<VideoPlayer />} />
          <Route path="image" element={<ImageViewer />} />
          <Route path="3d" element={<ThreeDimensionViewer />} />
          <Route path="interactive" element={<Interactive />} />
          <Route path="viewer" element={<Viewer />} />
          <Route path="/" element={<MainLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="student" element={<Student />} />
            <Route path="module" element={<Module />} />
            {/* Internet dirender permanen di MainLayout (lihat di sana), biar
                webview + meeting di dalamnya nggak mati pas pindah halaman.
                Rutenya tetep ada supaya URL /internet valid, tapi elemennya kosong. */}
            <Route path="internet" element={null} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>

        {/* catch all */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </ToastProvider>
  );
};
