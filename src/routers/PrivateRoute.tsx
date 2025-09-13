import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HomeLayout from "../layouts/HomeLayout";
import FeatureLayout from "../layouts/FeatureLayout";

import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Student from "../pages/Student";
import Module from "../pages/Module";
import Internet from "../pages/Internet";

const PrivateRoute = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <>
              <Route
                element={
                  <HomeLayout>
                    <Home />
                  </HomeLayout>
                }
              />

              <Route
                path="/calendar"
                element={
                  <FeatureLayout>
                    <Calendar />
                  </FeatureLayout>
                }
              />

              <Route
                path="/student"
                element={
                  <FeatureLayout>
                    <Student />
                  </FeatureLayout>
                }
              />

              <Route
                path="/module"
                element={
                  <FeatureLayout>
                    <Module />
                  </FeatureLayout>
                }
              />

              <Route
                path="/internet"
                element={
                  <FeatureLayout>
                    <Internet />
                  </FeatureLayout>
                }
              />
            </>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace={true} />} />
      </Routes>
    </Router>
  );
};

export default PrivateRoute;
