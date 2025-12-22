import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout(){
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"270px 1fr", gap: 14 }}>
        <Sidebar />
        <div style={{ display:"grid", gap: 14 }}>
          <Topbar />
          <div className="glass" style={{
            borderRadius: 22,
            padding: 16,
            minHeight: "calc(100vh - 14px - 14px - 70px)"
          }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
