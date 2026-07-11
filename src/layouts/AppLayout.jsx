import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useTheme } from "../hooks/useTheme";

export function AppLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <Navbar isDark={isDark} onThemeToggle={toggleTheme} />
      <Outlet />
    </div>
  );
}
