import { Suspense } from "react";
import { HashRouter } from "react-router";
import Routes from "./routers";

function App() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <HashRouter>
        <Routes />
      </HashRouter>
    </Suspense>
  );
}

export default App;
