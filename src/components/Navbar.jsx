import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Map, ShoppingBag, SquareUser, Trophy, UserPlus } from "lucide-react";
import { navigationLinks } from "../constants/navigation";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { PointsBadge } from "./economy/PointsBadge";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";
import { cn } from "../utils/cn";

const mobileNavigationLinks = [
  { label: "الخريطة", href: "/stages", icon: Map },
  { label: "المتجر", href: "/store", icon: ShoppingBag },
  { label: "المتصدرون", href: "/leaderboard", icon: Trophy },
];

export function Navbar({ isDark, onThemeToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const showMobileNav = user && !location.pathname.startsWith("/game");

  useEffect(() => {
    document.documentElement.classList.toggle("mobile-nav-open", Boolean(showMobileNav));

    return () => {
      document.documentElement.classList.remove("mobile-nav-open");
    };
  }, [showMobileNav]);

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link to={user ? "/stages" : "/"} className="min-w-0 text-slate-950 dark:text-white">
            <BrandLogo imageClassName="h-10 w-10 sm:h-12 sm:w-12" textClassName="max-w-[8rem] sm:max-w-none" />
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-bold transition",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <div className="hidden lg:block">
                  <PointsBadge points={profile?.total_points || 0} />
                </div>
                <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    cn(
                      "grid h-11 w-11 place-items-center rounded-full border-2 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-violet-50 hover:text-primary active:scale-95 dark:bg-white/10 dark:text-white dark:shadow-[0_0_24px_rgba(124,58,237,0.18)] dark:hover:bg-white/20 md:hidden",
                      isActive ? "border-primary text-primary dark:border-primary dark:text-gold" : "border-slate-200 dark:border-white/15"
                    )
                  }
                  aria-label="الملف الشخصي"
                >
                  <SquareUser className="h-5 w-5" />
                </NavLink>
                <Button type="button" variant="secondary" className="hidden sm:inline-flex" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
                <Button as={Link} to="/login" variant="secondary" className="px-3 sm:px-5">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">دخول</span>
                </Button>
                <Button as={Link} to="/register" className="hidden px-3 sm:inline-flex sm:px-5">
                  <UserPlus className="h-4 w-4" />
                  تسجيل
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {showMobileNav ? (
        <nav className="mobile-safe-nav fixed inset-x-4 z-40 grid grid-cols-3 gap-1.5 rounded-[1.65rem] border border-slate-300/90 bg-white/90 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.24)] backdrop-blur-[18px] dark:border-[rgba(139,92,246,0.25)] dark:bg-[rgba(15,23,42,0.85)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:hidden">
          {mobileNavigationLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "group relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-center text-[11px] font-black transition duration-200",
                    isActive
                      ? "scale-[1.02] bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(124,58,237,0.42)]"
                      : "text-slate-800 hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-violet-500/10 dark:hover:text-white"
                  )
                }
              >
                <Icon className="h-5 w-5 transition group-hover:scale-110" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
