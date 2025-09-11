import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginLayout from "../layouts/LoginLayout";

import Login from "../pages/Auth/Login";
import SSO from "../pages/Auth/SSO";
import ForgotPassword from "../pages/Auth/ForgotPassword";

const PublicRoute = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginLayout>
              <Login />
            </LoginLayout>
          }
        />

        <Route
          path="/sso"
          element={
            <LoginLayout>
              <SSO />
            </LoginLayout>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <LoginLayout>
              <ForgotPassword />
            </LoginLayout>
          }
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={
            <LoginLayout>
              <Login />
            </LoginLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default PublicRoute;
