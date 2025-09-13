import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import Routes from "./routers";

function App() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
