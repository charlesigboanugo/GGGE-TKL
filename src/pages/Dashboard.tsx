import { DashboardSidebar } from "@/components/custom";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <section className="min-h-screen w-full flex gap-4">
      <DashboardSidebar />
      <Outlet />
    </section>
  );
}
