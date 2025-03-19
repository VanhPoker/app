import { Outlet } from "react-router-dom";
import Header from "..";

export default function DashboardRootPage() {


  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}
