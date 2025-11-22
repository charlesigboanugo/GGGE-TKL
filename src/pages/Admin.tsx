import { Outlet } from "react-router-dom";

export default function Admin() {
  return (
    <section className="w-full min-h-screen">
      <Outlet />
    </section>
  );
}
