import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginLayout from "../layouts/LoginLayout";

import Login from "../pages/Auth/Login";
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
          path="/forgot-password"
          element={
            <LoginLayout>
              <ForgotPassword />
            </LoginLayout>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace={true} />} />
      </Routes>
    </Router>
  );
};

export default PublicRoute;
