import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

import { supabase } from "@/lib/supabase";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Predict" },
  { to: "/disease-info", label: "Disease Info" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, role } = useAuth();
  const { result } = useApp();

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-sm"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-6 h-16 relative flex items-center justify-between">

        {/* =========================
            LOGO
        ========================= */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:scale-105 transition">
            <span className="text-primary font-bold">N</span>
          </div>

          <span className="font-heading font-bold text-lg tracking-wide">
            NephroAI
          </span>
        </Link>

        {/* =========================
            NAV LINKS
        ========================= */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium absolute left-1/2 -translate-x-1/2">

          {/* PUBLIC LINKS */}
          {publicLinks.map((link) => {
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-2 py-1 transition ${active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
                  }`}
              >
                {link.label}

                {active && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] bg-primary rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* =========================
              RESULT PAGE LINK
          ========================= */}
          {result && (
            <Link
              to="/result"
              className={`relative px-2 py-1 transition ${location.pathname === "/result"
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
                }`}
            >
              Results

              {location.pathname === "/result" && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute left-0 right-0 -bottom-1 h-[2px] bg-primary rounded-full"
                />
              )}
            </Link>
          )}

          {/* =========================
              ADMIN ONLY LINK
          ========================= */}
          {role === "admin" && (
            <Link
              to="/nephroaddmmiinn"
              className={`relative px-2 py-1 transition ${location.pathname === "/nephroaddmmiinn"
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
                }`}
            >
              Admin Dashboard

              {location.pathname === "/nephroaddmmiinn" && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute left-0 right-0 -bottom-1 h-[2px] bg-primary rounded-full"
                />
              )}
            </Link>
          )}
        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}
        <div className="flex items-center gap-3">

          {/* THEME TOGGLE */}
          <ThemeToggle />

          {/* =========================
              ADMIN UI
          ========================= */}
          {role === "admin" && user && (
            <>
              {/* ADMIN BADGE */}
              <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                Admin
              </span>

              {/* LOGOUT BUTTON */}
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-primary/10 transition"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;