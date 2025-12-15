import { Suspense } from "react";
import { HashRouter } from "react-router";

import Routes from "./routers";
import { ToastProvider } from "./provider/Toast.Provider";

function App() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <HashRouter>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </HashRouter>
    </Suspense>
  );
}

export default App;
