import { useSelector } from "react-redux";
import PublicRoute from "./routers/PublicRoute";
import PrivateRoute from "./routers/PrivateRoute";

function App() {
  const user = useSelector((state: any) => state.auth.user);

  if (user) {
    return <PrivateRoute />;
  }

  return <PublicRoute />;
}

export default App;
