import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import Routes from "./routers";
import { ToastProvider } from "./components/Toast";

function App() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <BrowserRouter>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
