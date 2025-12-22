import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import AdminLayout from "./components/layout/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Regions from "./pages/Regions";
import Enemies from "./pages/Enemies";
import Items from "./pages/Items";
import Rankings from "./pages/Rankings";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/enemies" element={<Enemies />} />
            <Route path="/items" element={<Items />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
