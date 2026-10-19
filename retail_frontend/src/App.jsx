import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Customer  from "./pages/Customer.jsx";
import Predict   from "./pages/Predict.jsx";
import History   from "./pages/History.jsx";

/**
 * App root — sets up the router, the persistent sidebar, and page routes.
 * The <Sidebar> renders a sticky left pane on desktop and a top-bar on mobile.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        {/* Page area — takes remaining space after the sidebar */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/customer"       element={<Customer />} />
            <Route path="/customer/:id"   element={<Customer />} />
            <Route path="/predict"        element={<Predict />} />
            <Route path="/history"        element={<History />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
