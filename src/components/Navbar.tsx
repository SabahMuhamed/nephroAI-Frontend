import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const links = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Predict" },
  { to: "/disease-info", label: "Disease Info" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-sm"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:scale-105 transition">
            <span className="text-primary font-bold">N</span>
          </div>
          <span className="font-heading font-bold text-lg tracking-wide">
            NephroAI
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium relative">
          {links.map((link) => {
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-2 py-1 text-muted-foreground hover:text-primary transition"
              >
                {link.label}

                {/* 🎯 Animated active indicator */}
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
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          <ThemeToggle />

          {user ? (
            <>
              {/* 🧠 ROLE BADGE */}
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${role === "admin"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {role === "admin" ? "Admin" : "User"}
              </span>

              {/* 🔥 ONLY ADMIN PANEL BUTTON */}
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:scale-105 transition"
                >
                  Admin Panel
                </Link>
              )}

              {/* LOGOUT */}
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-primary/10 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;