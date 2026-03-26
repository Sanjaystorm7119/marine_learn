import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Anchor, Menu, X, BookOpen, GraduationCap, LayoutDashboard, Users, Phone, LogIn, Settings } from "lucide-react";
import "../pages/nav.css";


 const navItems = [
   { label: "Home", path: "/", icon: Anchor },
  { label: "Courses", path: "/coursepage", icon: BookOpen },
   { label: "Departments", path: "/#departments", icon: LayoutDashboard },
   { label: "About", path: "/#about", icon: Users },
  { label: "Contact", path: "/#contact", icon: Phone },
   { label: "Settings", path: "/settings", icon: Settings },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="navbar"
    >
      <div className="navbar-container">
        <div className="navbar-inner">

          {/* Logo */}
          <Link
            to="/"
            className="navbar-logo"
          >
            <div className="logo-icon-wrapper">
              <Anchor className="logo-icon animate-wave-float" />
              <div className="logo-ripple animate-ripple" />
            </div>
            <div className="logo-text">
              <span className="logo-title">MarineLearn</span>
              <span className="logo-subtitle">Maritime Academy</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav">
            {navItems.map((item, i) => (
              <Link
                key={item.label}
                to={item.path}
                className="nav-link"
              >
                {item.label}
                <span className="nav-link-underline" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="desktop-cta">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/dashboard" className="btn btn-solid">
              <GraduationCap className="btn-icon" />
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-toggle"
          >
            {isOpen ? <X className="toggle-icon" /> : <Menu className="toggle-icon" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-menu"
          >
            <div className="mobile-menu-inner">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="mobile-nav-link"
                >
                  <item.icon className="mobile-nav-icon" />
                  {item.label}
                </Link>
              ))}
              <div className="mobile-cta">
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-ghost flex-1">Login</Link>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="btn btn-solid flex-1">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;