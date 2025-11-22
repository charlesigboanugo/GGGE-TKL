import { ButtonGhost } from "../utility";

export default function DashboardSidebar() {
  return (
    <nav className="hidden md:flex flex-col items-start justify-start px-8 py-16 gap-4">
      {["basic", "membership", "setting"].map((item) => (
        <ButtonGhost
          key={item}
          isLink={true}
          to={`/dashboard/${item}`}
          text={item.toUpperCase()}
          extraClasses="w-full text-start"
        />
      ))}
    </nav>
  );
}
